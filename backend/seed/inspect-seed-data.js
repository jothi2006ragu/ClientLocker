
require("dotenv").config();

const mongoose = require("mongoose");

const Firm = require("../models/Firm");
const Person = require("../models/Person");
const Client = require("../models/Client");
const ClientAccess = require("../models/ClientAccess");
const ChecklistItem = require("../models/ChecklistItem");

async function inspectData() {
  await mongoose.connect(process.env.MONGO_URI);

  const firm = await Firm.findOne({
    name: "Vaigai Vel & Associates"
  });

  if (!firm) {
    console.log("Seed firm not found.");
    return;
  }

  const people = await Person.find({
    firm_id: firm._id
  }).select("name email role client_id");

  const clients = await Client.find({
    firm_id: firm._id
  }).select("name");

  const clientIds = clients.map(client => client._id);

  const accessRecords = await ClientAccess.find({
    client_id: { $in: clientIds }
  }).populate("person_id", "name email role")
    .populate("client_id", "name");

  const checklistCount = await ChecklistItem.countDocuments({
    client_id: { $in: clientIds }
  });

  console.log("\n========== PEOPLE ==========");
  console.table(
    people.map(person => ({
      name: person.name,
      email: person.email,
      role: person.role,
      client_id: person.client_id?.toString() || "-"
    }))
  );

  console.log("\n========== CLIENTS ==========");
  console.table(
    clients.map(client => ({
      name: client.name,
      id: client._id.toString()
    }))
  );

  console.log("\n========== ACCESS RECORDS ==========");
  console.table(
    accessRecords.map(record => ({
      staff: record.person_id?.name || "Unknown",
      role: record.person_id?.role || "Unknown",
      client: record.client_id?.name || "Unknown"
    }))
  );

  console.log("\n========== TOTALS ==========");
  console.table({
    people: people.length,
    partners: people.filter(p => p.role === "partner").length,
    staff: people.filter(p => p.role === "staff").length,
    clients: people.filter(p => p.role === "client").length,
    clientRecords: clients.length,
    checklistItems: checklistCount,
    accessRecords: accessRecords.length
  });
}

inspectData()
  .catch(error => console.error("INSPECTION ERROR:", error))
  .finally(async () => {
    await mongoose.disconnect();
  });
