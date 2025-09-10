# Company Configuration for Invoices

This directory contains the company configuration used for generating PDF invoices.

## Files

- `company.js` - Main company configuration file
- `README.md` - This documentation file

## Customizing Company Details

### 1. Update Company Information

Edit the `company.js` file to update your company details:

```javascript
export const companyConfig = {
  name: "Your Company Name",           // Your company name
  phone: "+1 (555) 123-4567",         // Your phone number
  email: "info@yourcompany.com",      // Your email address
  address: {
    street: "123 Business Street",    // Street address
    city: "City Name",                // City
    state: "State",                   // State/Province
    zip: "12345",                     // ZIP/Postal code
    country: "Country"                // Country
  },
  website: "www.yourcompany.com",     // Your website
  logo: "/logo.svg",                  // Path to your logo
  taxId: "TAX-ID-12345",             // Your tax ID
  currency: "USD",                    // Currency code
  currencySymbol: "$"                 // Currency symbol
};
```

### 2. Update Company Logo

1. Replace the logo file in `frontend/public/logo.svg` with your own logo
2. Or update the `logo` path in `company.js` to point to your logo file
3. Supported formats: SVG, PNG, JPG

### 3. Programmatically Update Company Details

You can also update company details programmatically:

```javascript
import { updateCompanyConfig } from '../config/company';

updateCompanyConfig({
  name: "My Business Inc.",
  phone: "+1 (555) 987-6543",
  email: "contact@mybusiness.com",
  address: {
    street: "456 Corporate Ave",
    city: "Business City",
    state: "CA",
    zip: "90210",
    country: "USA"
  }
});
```

## PDF Invoice Features

The generated PDF invoices include:

- ✅ Company name and logo
- ✅ Company contact information (phone, email, website)
- ✅ Company address
- ✅ Invoice details (number, date, due date, status)
- ✅ Customer information
- ✅ Order details
- ✅ Invoice amount and total
- ✅ Notes section
- ✅ Tax ID and generation date
- ✅ Professional styling with company colors

## Usage

The PDF export functionality is available in:

1. **Invoice Detail Page** - Click "Export PDF" button
2. **Invoices List Page** - Click the download icon in the actions column

## Customization Options

- **Colors**: Edit the color values in `pdfExport.js`
- **Layout**: Modify the PDF layout in `pdfExport.js`
- **Styling**: Update fonts, sizes, and spacing in `pdfExport.js`
- **Content**: Add or remove sections in the PDF template
