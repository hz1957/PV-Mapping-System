# PV Mapping Project Analysis

## Overview

This project is a **Clinical Trial Data Mapping System** (临床试验数据映射功能流程) designed to help users map clinical trial datasets to standardized formats. It's built as a React-based web application that provides an intelligent mapping workflow for clinical data processing.

## Project Structure

```
pv-mapping/
├── README.md                    # Basic setup instructions
├── package.json                 # Dependencies and scripts
├── vite.config.ts              # Vite build configuration
├── index.html                  # Entry HTML file
└── src/
    ├── App.tsx                 # Main application component
    ├── main.tsx                # Application entry point
    ├── components/             # UI components
    │   ├── DatasetSelector.tsx     # Dataset selection interface
    │   ├── FrameworkSelector.tsx   # Target standard selection
    │   ├── MappingEditorV2.tsx     # Field mapping editor
    │   ├── ExportPreview.tsx       # Export preview functionality
    │   ├── MappingChangeHistory.tsx # Change history tracking
    │   ├── SearchableInput.tsx     # Search input component
    │   ├── SearchableSelect.tsx    # Searchable select component
    │   ├── ui/                      # shadcn/ui components
    │   └── figma/                   # Figma-related components
    ├── data/
    │   └── predefinedMappings.ts   # Predefined mapping configurations
    ├── utils/
    │   └── mockDataGenerator.ts    # Mock data generation utilities
    ├── guidelines/
    │   └── Guidelines.md           # Development guidelines
    ├── PRD.md                      # Detailed Product Requirements Document
    ├── Attributions.md             # Component attributions
    ├── index.css                   # Global styles
    ├── styles/globals.css          # Additional global styles
```

## Technology Stack

### Core Technologies
- **React 18.3.1** - UI framework with TypeScript support
- **TypeScript** - Type safety and enhanced development experience
- **Vite 6.3.5** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework

### UI Components & Libraries
- **shadcn/ui** - Modern component library built on Radix UI primitives
  - Accordion, Alert Dialog, Button, Card, Table, Dialog, Input, Select
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **React Hook Form** - Form management
- **Sonner** - Toast notifications

### Data Processing
- **xlsx** - Excel file export functionality
- **jspdf & jspdf-autotable** - PDF generation
- **date-fns** - Date manipulation utilities

## Key Features

### 1. Dataset Selection (`DatasetSelector.tsx`)
- Search and filter clinical trial datasets
- Display dataset metadata (form count, field count, file type)
- Support for various file formats (.rar, .zip, .xls, .xlsx, .csv, .sas, .html)
- Real-time search across dataset names and field headers
- Visual representation with file type icons

### 2. Framework Selection (`FrameworkSelector.tsx`)
- Four predefined mapping standards:
  1. **PV: Visualization** (v3.4) - Data visualization standard
  2. **DM: New data listing** (R2) - Data listing and reporting
  3. **CD: RBM** (v2.0) - Risk-Based Monitoring
  4. **MM: patient profile** (2024) - Patient profile documentation

### 3. Mapping Editor (`MappingEditorV2.tsx`)
- Dual-version support (V1 with AI assistance, V2 simplified)
- Editable table interface for field mapping
- Real-time field editing with validation
- Support for confidence scores and AI-generated rationale
- Statistics display (mapping progress, completion rate)
- Change history tracking

### 4. Export & Preview (`ExportPreview.tsx`)
- Read-only preview of final mapping configuration
- Excel export functionality with custom formatting
- Support for multiple export formats (Excel, PDF)

### 5. Change History (`MappingChangeHistory.tsx`)
- Track all mapping modifications
- Record operator information and timestamps
- Support for change type categorization

## Data Models

### Core Interfaces

```typescript
interface Dataset {
  id: string;
  name: string;
  headers: string[];           // All field names for search
  sheets: Sheet[];             // List of forms/worksheets
}

interface Sheet {
  name: string;                // Form name (DM, AE, LB, etc.)
  columns: string[];           // Field list
}

interface Mapping {
  sourceSheetName: string;     // Source form name
  sourceColumnName: string;    // Source field name
  standardSheetName: string;   // Target form name
  standardColumnName: string;  // Target field name
  infoType: string;           // Information type
  note: string;               // Notes
  confidence: number;         // AI confidence score (0-1)
  rationale: string;          // AI reasoning
}

interface TargetFramework {
  id: string;
  name: string;               // Standard name
  description: string;        // Standard description
  version: string;           // Version number
  sheets: TargetSheet[];     // Target field definitions
}
```

### Clinical Trial Forms Supported
- **DM (Demographics)**: Patient demographics and enrollment data
- **AE (Adverse Events)**: Adverse event reporting and tracking
- **MH (Medical History)**: Patient medical history
- **LB (Laboratory)**: Laboratory test results
- **SV (Subject Visits)**: Visit scheduling and tracking
- **CM (Concomitant Medications)**: Concurrent medication tracking
- **EX (Exposure)**: Study drug administration records
- **VS (Vital Signs)**: Vital signs measurements

## Intelligent Mapping Algorithm

The system implements a three-tier mapping strategy:

1. **Predefined Mappings** (`predefinedMappings.ts`)
   - Exact matches for known CDISC datasets
   - High-confidence mappings with detailed rationale
   - Support for real clinical data structures

2. **Intelligent Matching**
   - Field name similarity analysis
   - Pattern recognition for standard naming conventions
   - Context-aware suggestions based on form types

3. **Fallback Assignment**
   - Ensures every field receives a mapping
   - Maintains data integrity
   - Allows for manual refinement

## Mock Data Generation

The `mockDataGenerator.ts` provides intelligent mock data generation:
- Context-aware data based on field names
- Realistic clinical trial data patterns
- Support for dates, times, medical terminology
- Proper format handling (IDs, codes, measurements)

## User Workflow

1. **Dataset Selection**
   - Browse or search available datasets
   - View dataset metadata
   - Select target dataset for mapping

2. **Framework Selection**
   - Choose appropriate mapping standard
   - View framework details and field requirements
   - Generate initial mapping configuration

3. **Mapping Configuration**
   - Review automatically generated mappings
   - Edit field assignments as needed
   - Add custom notes and information types
   - Validate mapping completeness

4. **Export & Validation**
   - Preview final mapping configuration
   - Export to Excel or PDF formats
   - Save mapping for future reference

5. **History Management**
   - View previously saved mappings
   - Edit existing configurations
   - Track changes over time

## UI/UX Features

### Design System
- **Color Scheme**: Primary blue-purple (#5b5fc7) with semantic colors
- **Typography**: System font stack for optimal readability
- **Responsive Design**: Mobile-friendly with adaptive layouts
- **Accessibility**: WCAG compliant with keyboard navigation

### Interactive Elements
- Real-time search and filtering
- Drag-and-drop functionality (where applicable)
- Keyboard shortcuts for power users
- Progress indicators and status updates
- Contextual help and validation messages

## Performance Optimizations

- **React.memo** for component optimization
- Efficient state management with minimal re-renders
- Virtual scrolling for large datasets
- Lazy loading of components and data
- Optimized bundle splitting with Vite

## Development Environment

### Setup Requirements
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Key Development Files
- **Vite Configuration**: Optimized build with code splitting
- **TypeScript Config**: Strict type checking and modern features
- **ESLint & Prettier**: Code quality and formatting standards

## Future Enhancements (Based on PRD)

### V1.1 (Short-term)
- [ ] Batch editing capabilities
- [ ] Mapping template functionality
- [ ] Excel configuration import
- [ ] Enhanced search with fuzzy matching
- [ ] Undo/redo functionality

### V1.2 (Medium-term)
- [ ] AI-powered recommendation improvements
- [ ] Custom mapping standards support
- [ ] Data validation rules
- [ ] Visual mapping relationship graphs
- [ ] Multi-user collaboration

### V2.0 (Long-term)
- [ ] Backend API integration
- [ ] User permission management
- [ ] Mapping approval workflows
- [ ] Data quality checking
- [ ] Statistical reporting and analytics

## Security Considerations

- Client-side data processing for privacy
- No external API calls for sensitive data
- Local storage for user preferences
- Input validation and sanitization
- Secure file handling for uploads/exports

## Browser Compatibility

- **Chrome 90+** ✅
- **Firefox 88+** ✅
- **Safari 14+** ✅
- **Edge 90+** ✅
- **Mobile browsers** ⚠️ (Limited support)

## Conclusion

The PV Mapping System represents a sophisticated solution for clinical trial data standardization, combining intelligent automation with user-friendly interfaces. Its modular architecture, comprehensive data models, and extensible design make it well-suited for clinical research environments requiring efficient and accurate data mapping workflows.

The project demonstrates best practices in React development, TypeScript usage, and modern UI/UX design, while addressing the specific needs of clinical trial data management professionals.