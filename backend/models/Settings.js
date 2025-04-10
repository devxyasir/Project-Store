const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  paymentMethods: {
    NayaPay: { 
      enabled: { 
        type: Boolean, 
        default: true 
      },
      accountDetails: {
        name: { type: String, default: 'Project Store' },
        number: { type: String, default: '03001234567' }
      }
    },
    JazzCash: { 
      enabled: { 
        type: Boolean, 
        default: true 
      },
      accountDetails: {
        name: { type: String, default: 'Project Store' },
        number: { type: String, default: '03001234567' }
      }
    },
    Easypaisa: { 
      enabled: { 
        type: Boolean, 
        default: true 
      },
      accountDetails: {
        name: { type: String, default: 'Project Store' },
        number: { type: String, default: '03001234567' }
      }
    },
    JazzCashToNayaPay: { 
      enabled: { 
        type: Boolean, 
        default: true 
      },
      accountDetails: {
        name: { type: String, default: 'Project Store' },
        number: { type: String, default: '03001234567' },
        raastId: { type: String, default: 'RS5YZ12345' }
      }
    }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// There should only be one settings document
SettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    console.log('Creating new settings document');
    settings = await this.create({});
  }
  return settings;
};

// Helper method to ensure all payment methods exist
SettingsSchema.statics.ensurePaymentMethodsExist = async function() {
  const settings = await this.getSettings();
  let updated = false;
  
  // Make sure JazzCashToNayaPay method exists
  if (!settings.paymentMethods.JazzCashToNayaPay) {
    settings.paymentMethods.JazzCashToNayaPay = {
      enabled: true,
      accountDetails: {
        name: 'Project Store',
        number: '03001234567',
        raastId: 'RS5YZ12345'
      }
    };
    updated = true;
  }
  
  // If JazzCashToNayaPay exists but doesn't have raastId, add it
  if (settings.paymentMethods.JazzCashToNayaPay && 
      !settings.paymentMethods.JazzCashToNayaPay.accountDetails.raastId) {
    settings.paymentMethods.JazzCashToNayaPay.accountDetails.raastId = 'RS5YZ12345';
    updated = true;
  }
  
  if (updated) {
    await settings.save();
    console.log('Updated payment methods settings');
  }
  
  return settings;
};

module.exports = mongoose.model('Settings', SettingsSchema);
