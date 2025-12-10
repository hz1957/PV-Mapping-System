
import random
from datetime import datetime
from sqlalchemy.orm import Session
from . import models, database

def seed_data():
    db = database.SessionLocal()
    
    try:
        # Check if data exists
        if db.query(models.Dataset).first():
            print("Data already exists. Skipping seed.")
            return

        print("Seeding Frameworks...")
        # 1. Frameworks
        frameworks_data = [
            {
                "name": "PV: Visualization",
                "version": "v3.4",
                "description": "临床试验数据可视化标准 - 用于图表展示和数据分析",
                "sheets": [
                    ("AE", "AEACN_CATEGORY", "AE采取措施"), ("AE", "AESER", "是否严重不良事件"), ("AE", "AESI", "是否为AESI"),
                    ("AE", "AE_CESSATION_DATE", "AE结束日期（必填）"), ("AE", "AE_CESSATION_TIME", "AE结束时间列"),
                    ("AE", "AE_ONSET_DATE", "AE开始日期（必填）"), ("AE", "AE_ONSET_TIME", "AE开始时间列"),
                    ("AE", "CAUSALITY_REPORTER", "研究者相关性判断"), ("DM", "SUBJID", "受试者编号"), ("DM", "SITEID", "中心ID"),
                    ("DM", "AGE", "年龄"), ("DM", "SEX", "性别"), ("LB", "LBTESTCD", "检查项目代码"), ("LB", "LBORRES", "原始结果")
                ]
            },
            {
                "name": "DM: New data listing",
                "version": "R2",
                "description": "临床试验新数据清单标准",
                "sheets": [
                    ("AE", "EVENT_NAME", "事件名称"), ("AE", "SEVERITY", "严重程度"), ("DM", "PATIENT_ID", "患者ID"),
                    ("DM", "SITE_NUMBER", "中心编号")
                ]
            },
            {
               "name": "CD: RBM",
               "version": "v2.0",
               "description": "Risk-Based Monitoring",
               "sheets": [
                   ("AE", "BLSJ", "不良事件"), ("AE", "YZCD", "严重程度"), ("DM", "SSBH", "受试者编号")
               ]
            }
        ]

        for fw in frameworks_data:
            db_fw = models.Framework(name=fw["name"], version=fw["version"], description=fw["description"])
            db.add(db_fw)
            db.commit()
            db.refresh(db_fw)
            
            for s_name, c_name, note in fw["sheets"]:
                db.add(models.FrameworkSheet(framework_id=db_fw.id, sheet_name=s_name, column_name=c_name, note=note))
        
        db.commit()

        print("Seeding Datasets...")
        # 2. Datasets
        study_types = [
            '心血管疾病三期临床试验', '肿瘤药物二期临床试验', '糖尿病新药临床研究', '抗生素临床试验',
            '疫苗安全性评估', '神经系统药物研究', '呼吸系统疾病临床', '免疫治疗临床数据'
        ]
        extensions = ['.xlsx', '.csv', '.sas']
        years = ['2023', '2024', '2025']
        
        # Define Sheet Schemas
        sheet_defs = {
            'DM': ['受试者编号', '中心ID', '性别', '年龄', '出生日期', '入组日期', '受试者状态', '种族'],
            'AE': ['受试者编号', '中心ID', '不良事件名称', '严重程度', '开始时间', '结束时间', '是否严重', '因果关系'],
            'MH': ['受试者编号', '中心ID', '疾病名称', '诊断日期', '治疗情况', '是否持续'],
            'LB': ['受试者编号', '中心ID', '检查项目', '检查值', '单位', '参考范围', '检查日期'],
            'VS': ['受试者编号', '中心ID', '测量项目', '测量值', '单位', '测量时间']
        }

        # Real CDISC
        cdisc_ae = ['AEACN_SUB', 'AESER', 'AESI', 'AEENDAT_RAW', 'AEENTIM', 'AESTDAT_RAW', 'AESTTIM']
        cdisc_ex = ['EXDOSTOT_ACT', 'EXENDAT_RAW', 'EXSTDAT_RAW', 'ARMDOSE', 'EXDOSE_PLAN']
        
        # Add CDISC Dataset
        ds_cdisc = models.Dataset(name="真实CDISC临床数据集.xlsx")
        db.add(ds_cdisc)
        db.commit()
        db.refresh(ds_cdisc)
        
        s1 = models.DatasetSheet(dataset_id=ds_cdisc.id, name="ae")
        db.add(s1)
        db.commit()
        for col in cdisc_ae:
            db.add(models.DatasetColumn(sheet_id=s1.id, name=col))
            
        s2 = models.DatasetSheet(dataset_id=ds_cdisc.id, name="ex")
        db.add(s2)
        db.commit()
        for col in cdisc_ex:
            db.add(models.DatasetColumn(sheet_id=s2.id, name=col))
            
        # Add Random Datasets
        # Generate ~20 datasets for demo
        for st in study_types:
            for _ in range(3):
                name = f"{random.choice(years)}{st}{random.choice(extensions)}"
                ds = models.Dataset(name=name)
                db.add(ds)
                db.commit()
                db.refresh(ds)
                
                # Pick random sheets
                chosen_sheets = random.sample(list(sheet_defs.keys()), k=random.randint(3, 5))
                for sheet_name in chosen_sheets:
                    d_sheet = models.DatasetSheet(dataset_id=ds.id, name=sheet_name)
                    db.add(d_sheet)
                    db.commit()
                    db.refresh(d_sheet)
                    
                    for col in sheet_defs[sheet_name]:
                        db.add(models.DatasetColumn(sheet_id=d_sheet.id, name=col))
        
        db.commit()
        print("Seeding Complete!")

    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
