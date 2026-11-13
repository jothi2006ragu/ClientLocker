
require("dotenv").config();

const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");

const Firm = require("../models/Firm");
const Person = require("../models/Person");
const Client = require("../models/Client");
const ChecklistItem = require("../models/ChecklistItem");
const StoredFile = require("../models/File");

const cloudinary = require("../config/cloudinary");
const { uploadToCloudinary } = require("../services/cloudinaryService");

const FIRM_NAME = "Vaigai Vel & Associates";

const sampleDocuments = [
  {
    clientName: "Aadhavan Traders",
    fileName: "March Bank Statement.pdf",
    checklistName: "March bank statement",
    title: "BANK STATEMENT",
    reference: "BANK-2026-001",
    rows: [
      ["01 March 2026", "Opening Balance", "0.00", "250000.00"],
      ["05 March 2026", "Customer Payment", "75000.00", "325000.00"],
      ["12 March 2026", "Supplier Payment", "25000.00", "300000.00"],
      ["20 March 2026", "Business Expenses", "15000.00", "285000.00"],
      ["31 March 2026", "Closing Balance", "0.00", "285000.00"]
    ]
  },
  {
    clientName: "Meenakshi Textiles",
    fileName: "March Sales Invoices.pdf",
    checklistName: "Sales invoices",
    title: "SALES INVOICE REGISTER",
    reference: "SALES-2026-002",
    rows: [
      ["03 March 2026", "Invoice INV-101", "45000.00", "Paid"],
      ["10 March 2026", "Invoice INV-102", "32000.00", "Paid"],
      ["18 March 2026", "Invoice INV-103", "58000.00", "Pending"],
      ["27 March 2026", "Invoice INV-104", "21000.00", "Paid"]
    ]
  },
  {
    clientName: "Pandian Exports",
    fileName: "March Purchase Invoices.pdf",
    checklistName: "Purchase invoices",
    title: "PURCHASE INVOICE REGISTER",
    reference: "PURCHASE-2026-003",
    rows: [
      ["04 March 2026", "Purchase PUR-201", "28000.00", "Paid"],
      ["11 March 2026", "Purchase PUR-202", "36000.00", "Paid"],
      ["19 March 2026", "Purchase PUR-203", "42000.00", "Pending"],
      ["25 March 2026", "Purchase PUR-204", "18000.00", "Paid"]
    ]
  },
  {
    clientName: "Vaigai Foods",
    fileName: "March Tax Summary.pdf",
    checklistName: "Tax return documents",
    title: "TAX DOCUMENT SUMMARY",
    reference: "TAX-2026-004",
    rows: [
      ["Sales Revenue", "185000.00"],
      ["Purchase Expenses", "92000.00"],
      ["Operating Expenses", "18000.00"],
      ["Net Business Amount", "75000.00"],
      ["Document Status", "Prepared for review"]
    ]
  },
  {
    clientName: "Thamarai Engineering",
    fileName: "Annual Financial Statement.pdf",
    checklistName: "Business financial statements",
    title: "FINANCIAL STATEMENT",
    reference: "FIN-2026-005",
    rows: [
      ["Total Revenue", "850000.00"],
      ["Operating Expenses", "320000.00"],
      ["Administrative Expenses", "80000.00"],
      ["Other Expenses", "50000.00"],
      ["Illustrative Net Amount", "400000.00"]
    ]
  }
];

function generatePDFBuffer(documentData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
        info: {
          Title: documentData.title,
          Author: "Vaigai Vel & Associates",
          Subject: "Fictional ClientLocker demonstration document"
        }
      });

      const chunks = [];

      doc.on("data", chunk => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      doc.fontSize(20)
        .fillColor("#174A8B")
        .text("VAIGAI VEL & ASSOCIATES", { align: "center" });

      doc.moveDown(0.5);

      doc.fontSize(10)
        .fillColor("#555555")
        .text("ACCOUNTING & FINANCIAL SERVICES", { align: "center" });

      doc.moveDown(2);

      doc.fontSize(17)
        .fillColor("#111111")
        .text(documentData.title, { align: "center" });

      doc.moveDown();

      doc.fontSize(10)
        .text(`Client: ${documentData.clientName}`)
        .text(`Reference: ${documentData.reference}`)
        .text("Period: March 2026")
        .text("Document Type: Demonstration Sample");

      doc.moveDown(1.5);

      doc.fontSize(11)
        .fillColor("#174A8B")
        .text("DOCUMENT DETAILS");

      doc.moveDown(0.5);

      doc.fontSize(10)
        .fillColor("#222222");

      for (const row of documentData.rows) {
        doc.text(row.join("     |     "), {
          paragraphGap: 8
        });
      }

      doc.moveDown(2);

      doc.fontSize(9)
        .fillColor("#777777")
        .text(
          "DEMONSTRATION DOCUMENT ONLY. All names, figures, transactions and references in this document are fictional and must not be used for actual accounting, tax filing or financial decisions.",
          { align: "justify" }
        );

      doc.moveDown(2);

      doc.text("Prepared for ClientLocker demonstration purposes.", {
        align: "center"
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

async function uploadSampleDocuments() {
  if (
    !process.env.MONGO_URI ||
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error(
      "MongoDB or Cloudinary environment configuration is missing."
    );
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected.");

  const firm = await Firm.findOne({ name: FIRM_NAME });

  if (!firm) {
    throw new Error("Seeded firm not found. Run npm run seed first.");
  }

  const partner = await Person.findOne({
    firm_id: firm._id,
    email: "kavitha.partner@clientlocker.test",
    role: "partner"
  });

  if (!partner) {
    throw new Error("Seeded partner account not found.");
  }

  let uploadedCount = 0;
  let skippedCount = 0;

  for (const documentData of sampleDocuments) {
    console.log(`\nProcessing: ${documentData.fileName}`);

    const client = await Client.findOne({
      firm_id: firm._id,
      name: documentData.clientName
    });

    if (!client) {
      throw new Error(`Client not found: ${documentData.clientName}`);
    }

    const existingFile = await StoredFile.findOne({
      client_id: client._id,
      name: documentData.fileName
    });

    if (existingFile) {
      console.log("Already exists. Skipping duplicate.");
      skippedCount++;
      continue;
    }

    const checklistItem = await ChecklistItem.findOne({
      client_id: client._id,
      name: documentData.checklistName
    });

    if (!checklistItem) {
      throw new Error(
        `Checklist item not found: ${documentData.checklistName}`
      );
    }

    // Generate PDF entirely in memory.
    const pdfBuffer = await generatePDFBuffer(documentData);

    if (pdfBuffer.length > 4 * 1024 * 1024) {
      throw new Error("Generated PDF exceeds the 4 MB limit.");
    }

    // Upload directly to authenticated Cloudinary storage.
    const cloudinaryResult = await uploadToCloudinary({
      buffer: pdfBuffer,
      mimetype: "application/pdf",
      originalname: documentData.fileName
    });

    try {
      await StoredFile.create({
        client_id: client._id,
        uploaded_by: partner._id,
        name: documentData.fileName,
        storage_path: cloudinaryResult.public_id,
        cloudinary_asset_id: cloudinaryResult.asset_id,
        cloudinary_resource_type: cloudinaryResult.resource_type,
        file_type: "PDF",
        file_size: cloudinaryResult.bytes,
        checklist_item_id: checklistItem._id
      });
    } catch (databaseError) {
      // Remove the Cloudinary asset if its database record cannot be saved.
      try {
        await cloudinary.uploader.destroy(
          cloudinaryResult.public_id,
          {
            resource_type: cloudinaryResult.resource_type,
            type: "authenticated",
            invalidate: true
          }
        );
      } catch (cleanupError) {
        console.error("Cloudinary cleanup failed:", cleanupError.message);
      }

      throw databaseError;
    }

    console.log("Uploaded successfully:", documentData.fileName);
    uploadedCount++;
  }

  console.log("\n==================================");
  console.log("SAMPLE DOCUMENT UPLOAD SUMMARY");
  console.log("==================================");
  console.log("New uploads:", uploadedCount);
  console.log("Skipped duplicates:", skippedCount);
  console.log("Total sample documents:", uploadedCount + skippedCount);
  console.log("Storage: Cloudinary");
  console.log("Metadata: MongoDB Atlas");
  console.log("==================================");

  if (uploadedCount + skippedCount !== sampleDocuments.length) {
    throw new Error("Not all sample documents were processed.");
  }

  console.log("\nSAMPLE DOCUMENT UPLOAD COMPLETED!");
}

uploadSampleDocuments()
  .catch(error => {
    console.error("\nUPLOAD FAILED:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("MongoDB disconnected.");
    }
  });
