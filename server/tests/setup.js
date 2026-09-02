const mongoose = require("mongoose");
const {
  MongoMemoryServer
} = require("mongodb-memory-server");

let mongoServer;

beforeAll(async () => {
  process.env.NODE_ENV = "test";

  process.env.JWT_SECRET =
    "test-secret-key";

  process.env.APP_TIMEZONE =
    "Asia/Kolkata";

  mongoServer =
    await MongoMemoryServer.create();

  const uri =
    mongoServer.getUri();

  await mongoose.connect(uri);
});

afterEach(async () => {
  const collections =
    mongoose.connection.collections;

  for (
    const key of Object.keys(collections)
  ) {
    await collections[
      key
    ].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();

  await mongoose.connection.close();

  if (mongoServer) {
    await mongoServer.stop();
  }
});