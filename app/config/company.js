export const companyConfig = {
  name: "Your Company Name",
  phone: "+1 (555) 123-4567",
  email: "info@yourcompany.com",
  address: {
    street: "123 Business Street",
    city: "City Name",
    state: "State",
    zip: "12345",
    country: "Country"
  },
  website: "www.yourcompany.com",
  logo: "/logo.svg", // Path to your company logo
  taxId: "TAX-ID-12345",
  currency: "USD",
  currencySymbol: "$"
};

export const getFullAddress = () => {
  const { address } = companyConfig;
  return `${address.street}, ${address.city}, ${address.state} ${address.zip}, ${address.country}`;
};

// Function to update company details
export const updateCompanyConfig = (newConfig) => {
  Object.assign(companyConfig, newConfig);
};

// Example usage:
// updateCompanyConfig({
//   name: "My Business Inc.",
//   phone: "+1 (555) 987-6543",
//   email: "contact@mybusiness.com",
//   address: {
//     street: "456 Corporate Ave",
//     city: "Business City",
//     state: "CA",
//     zip: "90210",
//     country: "USA"
//   }
// });
