import { CATEGORIES } from './mockProducts'

// Shared, app-wide product attributes — the single source of truth for both
// the standalone Attributes CMS page (/attributes) and Competitor Pricing's
// Spec Matching tab. Both read and write through AttributesContext, so an
// edit made in either place (add/rename/delete an attribute, add/remove a
// value) is immediately visible in the other.
//
// type: 'categorical' — values are plain option labels, scored on exact match.
// type: 'numeric'     — values are plain numbers (unit is separate, e.g.
//                        unit 'kg' + value '150' displays as "150kg"), scored
//                        on proximity and used for Stage 2 ratio/differential math.
// categories: which product categories (from mockProducts.CATEGORIES) this
//             attribute is available on — drives what shows up per-category
//             in Spec Matching's attribute pickers. Built directly from the
//             Core Product Match / Variant Match reference table — see
//             mockMatching.js's DEFAULT_CORE_ATTRIBUTE_SELECTION /
//             DEFAULT_VARIANT_ATTRIBUTE_SELECTION for the exact per-category
//             picks (by id) that table specifies.

export const INITIAL_ATTRIBUTES = [
  {
    id: 1, name: 'Product Type', type: 'categorical', unit: '',
    categories: [...CATEGORIES],
    values: ['Standard', 'Heavy Duty', 'Premium', 'Commercial Grade', 'Designer', 'Economy'],
  },
  {
    id: 2, name: 'Material', type: 'categorical', unit: '',
    categories: [...CATEGORIES],
    values: ['Aluminium', 'Stainless Steel', 'Chrome', 'Nylon', 'Timber', 'Plastic Composite', 'Rubber', 'FRP', 'PVC', 'Diatomite', 'Foam', 'Adhesive Tape', 'Composite', 'Steel', 'Carbon Fibre', 'Teak', 'Brass'],
  },
  {
    id: 3, name: 'Color', type: 'categorical', unit: '',
    categories: [
      'Aluminium Threshold Ramps', 'Antislip Tapes', 'Bathroom Solutions', 'Concealed Fix Grab Rails',
      'Exposed/Narrow Flange Grab Rails', 'FRP Ramp Grating', 'Shower Curtain', 'Shower Grab Rails',
      'Shower Screen', 'Sliding Grab Rails', 'Slip Guard', 'Standard Rubber Ramp', 'Towel Grab Rails',
    ],
    values: ['Silver', 'White', 'Black', 'Chrome', 'Grey', 'Blue', 'Natural', 'Natural Wood', 'Yellow', 'Clear'],
  },
  {
    id: 4, name: 'Finish', type: 'categorical', unit: '',
    categories: [
      'Aluminium Cover Strips', 'Aluminium Threshold Ramps', 'Angled Toilet Grab Rails', 'Bathroom Solutions',
      'Concealed Fix Grab Rails', 'Drop Down Grab Rail Posts', 'Drop Down Grab Rails', 'Exposed/Narrow Flange Grab Rails',
      'Lever Taps', 'M-Clips & Screws', 'Modular Grab Rails', 'Offset Grab Rails', 'Shower Curtain', 'Shower Grab Rails',
      'Shower Screen', 'Sliding Grab Rails', 'Slip Guard', 'Standard Rubber Ramp', 'Towel Grab Rails',
    ],
    values: ['Polished', 'Brushed', 'Matte', 'Powder Coated', 'Anodised', 'Chrome Plated'],
  },
  {
    id: 5, name: 'Drilling Option', type: 'categorical', unit: '',
    categories: ['Aluminium Cover Strips'],
    values: ['Pre-Drilled', 'Non-Drilled', 'Custom Drilled'],
  },
  {
    id: 6, name: 'Fixing Type', type: 'categorical', unit: '',
    categories: ['Angled Toilet Grab Rails', 'Concealed Fix Grab Rails', 'Exposed/Narrow Flange Grab Rails', 'Offset Grab Rails', 'Sliding Grab Rails'],
    values: ['Concealed Fix', 'Exposed Fix', 'Flange Fix', 'Screw Fix', 'Track Mounted'],
  },
  {
    id: 7, name: 'Angle', type: 'categorical', unit: '',
    categories: ['Angled Toilet Grab Rails'],
    values: ['90°', '120°', '135°', '145°'],
  },
  {
    id: 8, name: 'Handling', type: 'categorical', unit: '',
    categories: ['Angled Toilet Grab Rails', 'Shower Grab Rails'],
    values: ['Left Hand', 'Right Hand', 'Ambidextrous'],
  },
  {
    id: 9, name: 'Compliance', type: 'categorical', unit: '',
    categories: [
      'Angled Toilet Grab Rails', 'Concealed Fix Grab Rails', 'Drop Down Grab Rails', 'Exposed/Narrow Flange Grab Rails',
      'Modular Grab Rails', 'Offset Grab Rails', 'Portable Rubber Ramps', 'Ramp and Wings Combo', 'Shower Grab Rails',
      'Sliding Grab Rails', 'Towel Grab Rails',
    ],
    values: ['AS 1428.1', 'AS 4586', 'NDIS Approved'],
  },
  {
    id: 10, name: 'Diameter', type: 'numeric', unit: 'mm',
    categories: [
      'Angled Toilet Grab Rails', 'Concealed Fix Grab Rails', 'Curtain Accessories', 'Drop Down Grab Rails',
      'Exposed/Narrow Flange Grab Rails', 'Modular Grab Rails', 'Offset Grab Rails', 'Shower Grab Rails',
      'Sliding Grab Rails', 'Towel Grab Rails',
    ],
    values: ['16', '19', '25', '28', '32', '35', '38'],
  },
  {
    id: 11, name: 'Slip Resistance Rating', type: 'categorical', unit: '',
    categories: ['Antislip Tapes', 'FRP Ramp Grating', 'FRP Stair Nosing'],
    values: ['P3', 'P4', 'P5', 'R10', 'R11', 'R12'],
  },
  {
    id: 12, name: 'Gradient', type: 'categorical', unit: '',
    categories: ['Aluminium Threshold Ramps', 'Portable Rubber Ramps', 'Ramp and Wings Combo', 'Toilet Accessories'],
    values: ['1:8', '1:10', '1:12', '1:14', '1:16', '1:20'],
  },
  {
    id: 13, name: 'Fixings', type: 'categorical', unit: '',
    categories: ['Aluminium Threshold Ramps'],
    values: ['Screws Included', 'Adhesive Included', 'Sold Separately'],
  },
  {
    id: 14, name: 'Pack Qty', type: 'numeric', unit: '',
    categories: ['Curtain Accessories'],
    values: ['2', '4', '6', '8', '10', '12'],
  },
  {
    id: 15, name: 'Installation Method', type: 'categorical', unit: '',
    categories: ['FRP Stair Nosing'],
    values: ['Screw Fix', 'Adhesive Fix', 'Drop-In'],
  },
  {
    id: 16, name: 'Hole Fixing', type: 'categorical', unit: '',
    categories: ['Exposed/Narrow Flange Grab Rails'],
    values: ['Pre-Drilled', 'Countersunk', 'Standard'],
  },
  {
    id: 17, name: 'Flange Shape', type: 'categorical', unit: '',
    categories: ['Exposed/Narrow Flange Grab Rails'],
    values: ['Round', 'Oval', 'Square'],
  },
  {
    id: 18, name: 'Fabric Weight', type: 'numeric', unit: 'gsm',
    categories: ['Shower Curtain'],
    values: ['180', '200', '220', '250', '280'],
  },
  {
    id: 19, name: 'Length', type: 'numeric', unit: 'mm',
    categories: [
      'Aluminium Cover Strips', 'Angled Toilet Grab Rails', 'Antislip Tapes', 'Bathroom Solutions',
      'Concealed Fix Grab Rails', 'Door Magnets & Posts', 'Drop Down Grab Rail Posts', 'Drop Down Grab Rails',
      'Exposed/Narrow Flange Grab Rails', 'FRP Ramp Grating', 'FRP Stair Nosing', 'Modular Grab Rails',
      'Offset Grab Rails', 'Shower Grab Rails', 'Sliding Grab Rails', 'Slip Guard', 'Towel Grab Rails',
    ],
    values: ['300', '450', '600', '750', '900', '1200', '1500', '2000', '3000'],
  },
  {
    id: 20, name: 'Width', type: 'numeric', unit: 'mm',
    categories: [
      'Aluminium Cover Strips', 'Aluminium Threshold Ramps', 'Antislip Tapes', 'Bathroom Solutions',
      'Door Magnets & Posts', 'Door Pull Straps', 'Fold Down Shower Seat', 'Modular Grab Rails',
      'Portable Rubber Ramps', 'Ramp and Wings Combo', 'Shower Curtain', 'Shower Grab Rails', 'Shower Screen',
      'Slip Guard', 'Standard Rubber Ramp',
    ],
    values: ['20', '40', '60', '80', '100', '150', '300', '450', '600', '700', '750', '800', '850', '900'],
  },
  {
    id: 21, name: 'Height', type: 'numeric', unit: 'mm',
    categories: ['Aluminium Cover Strips', 'Angled Toilet Grab Rails', 'Door Pull Straps', 'Fold Down Shower Seat', 'FRP Ramp Grating', 'FRP Stair Nosing', 'Shower Screen'],
    values: ['50', '75', '100', '125', '150', '200', '300', '1800', '1900', '2000'],
  },
  {
    id: 22, name: 'Weight Capacity', type: 'numeric', unit: 'kg',
    categories: ['Drop Down Grab Rails', 'Fold Down Shower Seat'],
    values: ['100', '120', '150', '160', '165', '170', '180', '200'],
  },
  {
    id: 23, name: 'Depth', type: 'numeric', unit: 'mm',
    categories: ['Aluminium Threshold Ramps', 'FRP Ramp Grating', 'FRP Stair Nosing', 'Portable Rubber Ramps', 'Ramp and Wings Combo', 'Standard Rubber Ramp'],
    values: ['300', '400', '500', '600', '800', '1000'],
  },
  {
    id: 24, name: 'Rise', type: 'numeric', unit: 'mm',
    categories: ['Aluminium Threshold Ramps', 'Portable Rubber Ramps', 'Ramp and Wings Combo', 'Standard Rubber Ramp'],
    values: ['25', '50', '75', '100', '150', '200'],
  },
  {
    id: 25, name: 'Drop', type: 'numeric', unit: 'mm',
    categories: ['Shower Curtain'],
    values: ['1800', '1900', '2000', '2100'],
  },
  {
    id: 26, name: 'Warranty', type: 'numeric', unit: ' years',
    categories: [...CATEGORIES],
    values: ['1', '2', '3', '5', '7', '10'],
  },
]
