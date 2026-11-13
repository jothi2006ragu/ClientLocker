
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Firm = require("../models/Firm");
const Person = require("../models/Person");
const Client = require("../models/Client");
const ClientAccess = require("../models/ClientAccess");
const ChecklistItem = require("../models/ChecklistItem");

// ==========================================
// SEED DATA
// ==========================================

const partners = [
  ["Kavitha Vel", "kavitha.partner@clientlocker.test"],
  ["Arun Vel", "arun.partner@clientlocker.test"]
];

const staff = [
  ["Priya Raman", "priya.staff@clientlocker.test"],
  ["Karthik Kumar", "karthik.staff@clientlocker.test"],
  ["Divya Raj", "divya.staff@clientlocker.test"],
  ["Suresh Balan", "suresh.staff@clientlocker.test"],
  ["Meena Joseph", "meena.staff@clientlocker.test"],
  ["Gokul Trainee", "gokul.trainee@clientlocker.test"]
];

const auditorData = [
  "Senthil Nathan",
  "senthil.auditor@clientlocker.test"
];

const clients = [
  "Aadhavan Traders",
  "Meenakshi Textiles",
  "Pandian Exports",
  "Vaigai Foods",
  "Thamarai Engineering",
  "Kurinji Enterprises",
  "Marutham Agencies",
  "Annamalai Stores",
  "Chola Packaging",
  "Ponni Agro Products"
];

const checklist = [
  "March bank statement",
  "Sales invoices",
  "Purchase invoices",
  "Tax return documents",
  "Business financial statements"
];

const FIRM_NAME = "Vaigai Vel & Associates";
const DEMO_PASSWORD = "ClientLocker@2026";
const PASSWORD_SALT_ROUNDS = 10;

// ==========================================
// HELPER: CREATE OR UPDATE PERSON
// ==========================================

async function createPerson(
  firmId,
  name,
  email,
  role,
  passwordHash,
  clientId = null
) {
  return Person.findOneAndUpdate(
    {
      firm_id: firmId,
      email
    },
    {
      $set: {
        name,
        email,
        role,
        password_hash: passwordHash,
        client_id: clientId
      }
    },
    {
      upsert: true,
      returnDocument: "after",
      runValidators: true,
      setDefaultsOnInsert: true
    }
  );
}

// ==========================================
// HELPER: CREATE OR GET FIRM
// ==========================================

async function createFirm() {
  return Firm.findOneAndUpdate(
    { name: FIRM_NAME },
    {
      $set: {
        name: FIRM_NAME
      }
    },
    {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true
    }
  );
}

// ==========================================
// HELPER: CREATE OR GET CLIENT
// ==========================================

async function createClient(firmId, name) {
  return Client.findOneAndUpdate(
    {
      firm_id: firmId,
      name
    },
    {
      $set: {
        firm_id: firmId,
        name
      }
    },
    {
      upsert: true,
      returnDocument: "after",
      runValidators: true,
      setDefaultsOnInsert: true
    }
  );
}

// ==========================================
// HELPER: CREATE ACCESS ASSIGNMENT
// ==========================================

async function createAccess(personId, clientId, partnerId) {
  return ClientAccess.updateOne(
    {
      person_id: personId,
      client_id: clientId
    },
    {
      $setOnInsert: {
        person_id: personId,
        client_id: clientId,
        given_by: partnerId
      }
    },
    {
      upsert: true
    }
  );
}

// ==========================================
// MAIN SEED FUNCTION
// ==========================================

async function seedDatabase() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in .env");
  }

  console.log("Connecting to MongoDB Atlas...");

  await mongoose.connect(process.env.MONGO_URI);

  console.log("MongoDB connected successfully.");

  // Hash the same demo password for every seeded account.
  const passwordHash = await bcrypt.hash(
    DEMO_PASSWORD,
    PASSWORD_SALT_ROUNDS
  );

  // ----------------------------------------
  // 1. CREATE FIRM
  // ----------------------------------------

  const firm = await createFirm();

  console.log("Firm:", firm.name);

  // ----------------------------------------
  // 2. CREATE PARTNERS
  // ----------------------------------------

  const partnerRecords = [];

  for (const [name, email] of partners) {
    const person = await createPerson(
      firm._id,
      name,
      email,
      "partner",
      passwordHash
    );

    partnerRecords.push(person);
  }

  console.log("Partners:", partnerRecords.length);

  // ----------------------------------------
  // 3. CREATE STAFF
  // ----------------------------------------

  const staffRecords = [];

  for (const [name, email] of staff) {
    const person = await createPerson(
      firm._id,
      name,
      email,
      "staff",
      passwordHash
    );

    staffRecords.push(person);
  }

  console.log("Staff:", staffRecords.length);
  console.log("Trainee: Gokul Trainee");

  // ----------------------------------------
  // 4. CREATE CLIENTS
  // ----------------------------------------

  const clientRecords = [];

  for (const name of clients) {
    const client = await createClient(firm._id, name);
    clientRecords.push(client);
  }

  console.log("Clients:", clientRecords.length);

  // ----------------------------------------
  // 5. CREATE CLIENT LOGIN ACCOUNTS
  // ----------------------------------------

  const clientAccountRecords = [];

  for (const client of clientRecords) {
    const slug = client.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ".")
      .replace(/^\.+|\.+$/g, "");

    const email = `${slug}.client@clientlocker.test`;

    const person = await createPerson(
      firm._id,
      client.name,
      email,
      "client",
      passwordHash,
      client._id
    );

    clientAccountRecords.push(person);
  }

  console.log("Client accounts:", clientAccountRecords.length);

  // ----------------------------------------
  // 6. CREATE AUDITOR
  // ----------------------------------------

  const auditor = await createPerson(
    firm._id,
    auditorData[0],
    auditorData[1],
    "auditor",
    passwordHash
  );

  console.log("Auditor:", auditor.name);

  // ----------------------------------------
  // 7. CREATE FIVE CHECKLIST ITEMS PER CLIENT
  // ----------------------------------------

  for (const client of clientRecords) {
    for (const item of checklist) {
      await ChecklistItem.updateOne(
        {
          client_id: client._id,
          name: item
        },
        {
          $setOnInsert: {
            client_id: client._id,
            name: item,
            done: false
          }
        },
        {
          upsert: true
        }
      );
    }
  }

  console.log(
    "Checklist items:",
    clientRecords.length * checklist.length
  );

  // ----------------------------------------
  // 8. CREATE STAFF-CLIENT ASSIGNMENTS
  // ----------------------------------------

  for (let i = 0; i < clientRecords.length; i++) {
    const assignedStaff =
      i < 8
        ? staffRecords[i % 5]
        : staffRecords[5];

    await createAccess(
      assignedStaff._id,
      clientRecords[i]._id,
      partnerRecords[0]._id
    );
  }

  console.log("Staff assignments: 10");

  // ----------------------------------------
  // 9. ASSIGN AUDITOR TO EXACTLY TWO CLIENTS
  // ----------------------------------------

  // Remove any previous assignments for this seeded auditor.
  // This ensures rerunning the seed does not leave extra assignments.
  await ClientAccess.deleteMany({
    person_id: auditor._id
  });

  // Auditor gets access to:
  // 1. Aadhavan Traders
  // 2. Annamalai Stores

  const auditorClientIndexes = [0, 7];

  for (const index of auditorClientIndexes) {
    await createAccess(
      auditor._id,
      clientRecords[index]._id,
      partnerRecords[0]._id
    );
  }

  console.log("Auditor assignments: 2");

  // ==========================================
  // 10. VERIFY SEEDED RECORDS
  // ==========================================

  const partnerEmails = partners.map(person => person[1]);
  const staffEmails = staff.map(person => person[1]);
  const clientEmails = clientAccountRecords.map(person => person.email);

  const seededClientIds = clientRecords.map(client => client._id);
  const seededStaffIds = staffRecords.map(person => person._id);

  const counts = {
    firms: await Firm.countDocuments({
      _id: firm._id
    }),

    partners: await Person.countDocuments({
      firm_id: firm._id,
      email: { $in: partnerEmails },
      role: "partner",
      password_hash: { $nin: [null, ""] }
    }),

    staff: await Person.countDocuments({
      firm_id: firm._id,
      email: { $in: staffEmails },
      role: "staff",
      password_hash: { $nin: [null, ""] }
    }),

    clientAccounts: await Person.countDocuments({
      firm_id: firm._id,
      email: { $in: clientEmails },
      role: "client",
      password_hash: { $nin: [null, ""] }
    }),

    clients: await Client.countDocuments({
      firm_id: firm._id,
      _id: { $in: seededClientIds }
    }),

    checklist: await ChecklistItem.countDocuments({
      client_id: { $in: seededClientIds }
    }),

    staffAccess: await ClientAccess.countDocuments({
      person_id: { $in: seededStaffIds },
      client_id: { $in: seededClientIds }
    }),

    auditors: await Person.countDocuments({
      _id: auditor._id,
      role: "auditor",
      password_hash: { $nin: [null, ""] }
    }),

    auditorAccess: await ClientAccess.countDocuments({
      person_id: auditor._id,
      client_id: { $in: seededClientIds }
    })
  };

  // ==========================================
  // 11. DISPLAY VERIFICATION RESULTS
  // ==========================================

  console.log("\n========== CLIENTLOCKER DATABASE CHECK ==========");

  console.table(counts);

  const expectedCounts = {
    firms: 1,
    partners: 2,
    staff: 6,
    clientAccounts: 10,
    clients: 10,
    checklist: 50,
    staffAccess: 10,
    auditors: 1,
    auditorAccess: 2
  };

  let verificationPassed = true;

  for (const key of Object.keys(expectedCounts)) {
    if (counts[key] !== expectedCounts[key]) {
      console.error(
        `${key}: Expected ${expectedCounts[key]}, got ${counts[key]}`
      );

      verificationPassed = false;
    }
  }

  if (!verificationPassed) {
    throw new Error("Database verification failed.");
  }

  console.log("\nAll seeded records verified successfully.");

  console.log("\n========== DEMO LOGIN DETAILS ==========");

  console.log("Demo password: [configured]");
  console.log("Partners:");
  partners.forEach(([, email]) => console.log(`- ${email}`));

  console.log("Staff:");
  staff.forEach(([, email]) => console.log(`- ${email}`));

  console.log("Auditor:");
  console.log(`- ${auditorData[1]}`);

  console.log("Client login emails:");
  clientAccountRecords.forEach(person => {
    console.log(`- ${person.email}`);
  });

  console.log("\n============================================");
  console.log("CLIENTLOCKER SEED COMPLETED SUCCESSFULLY!");
  console.log("============================================");
}

// ==========================================
// RUN SEED
// ==========================================

seedDatabase()
  .catch(error => {
    console.error("\nSEED ERROR:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("MongoDB disconnected.");
    }
  });
