const { assert } = require("chai");
const bcrypt = require("bcrypt");

const { getUserByEmail } = require("../helpers.js");
const { authenticateUser } = require("../helpers.js");
const { urlsForUser } = require("../helpers.js");
const { generateUniqueId } = require("../helpers.js");
const { addNewUser } = require("../helpers.js");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10),
  },
};

describe("getUserByEmail", function () {
  it("should return a user object with valid email", function () {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = testUsers["userRandomID"];
    assert.deepEqual(user, expectedOutput);
  });
});

describe("getUserByEmail", function () {
  it("should return false if the email is not in the database", function () {
    const user = getUserByEmail("user3@example.com", testUsers);
    const expectedOutput = false;
    assert.strictEqual(user, expectedOutput);
  });
});

describe("authenticateUser", function () {
  it("should return the user object if the password is correct", function () {
    const user = authenticateUser(
      "user2@example.com",
      "dishwasher-funk",
      testUsers
    );
    const expectedOutput = testUsers["user2RandomID"];
    assert.deepEqual(user, expectedOutput);
  });
});

describe("authenticateUser", function () {
  it("should return false if the password is incorrect", function () {
    const user = authenticateUser(
      "user2@example.com",
      "dishwasher-funp",
      testUsers
    );
    const expectedOutput = false;
    assert.strictEqual(user, expectedOutput);
  });
});

const testDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userId: "9424e04d" },
  "9sm5xK": { longURL: "http://www.google.com", userId: "9424e04d" },
  b5hT38: { longURL: "http://www.lighthouselabs.ca", userId: "5b2cdbcb" },
  V4hh35: { longURL: "http://www.facebook.com", userId: "5b2cdbcb" },
  B4l632: { longURL: "http://www.facebook.com", userId: "8gut8ew2" },
};

describe("urlsForUser", function () {
  it("should return the correct list of urls belonging to a user", function () {
    const urls = urlsForUser("5b2cdbcb", testDatabase);
    const expectedOutput = {
      b5hT38: "http://www.lighthouselabs.ca",
      V4hh35: "http://www.facebook.com",
    };
    assert.deepEqual(urls, expectedOutput);
  });
});

describe("urlsForUser", function () {
  it("should return an empty object if no urls belongs to the user", function () {
    const urls = urlsForUser("5b2tdbeb", testDatabase);
    const expectedOutput = {};
    assert.deepEqual(urls, expectedOutput);
  });
});

describe("addNewUser", function () {
  it("should add the new user object to the database", function () {
    const expected = addNewUser("abra.cadabra@gmail.com", "hello", testUsers);
    const actual = getUserByEmail("abra.cadabra@gmail.com", testUsers);
    assert.deepEqual(actual, expected);
  });
});

describe("generateUniqueId", function () {
  it("should return a string of 8 characters", function () {
    const generatedString = generateUniqueId(8);
    assert.strictEqual(generatedString.length, 8);
  });
});
