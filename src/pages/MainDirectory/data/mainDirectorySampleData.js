

const mainDirectorySampleData = [];

for (let i = 0; i < 30; i++) {
  mainDirectorySampleData.push({
    acctNo: (1077 + i).toString(),
    lastName: i % 2 === 0 ? "Darwin" : "Riccoboni",
    firstName: i % 2 === 0 ? "Charles" : "Rick",
    middleName: i % 2 === 0 ? "L" : "",
    prefix: i % 2 === 0 ? "Col" : "",
    residence: i % 2 === 0 ? "3010 Anywhere Lane" : "22 Pine Rd",
    billingAddress: i % 2 === 0 ? "3010 Anywhere Lane" : "22 Pine Rd",
    city: "North Aurora",
    state: "IL",
    zip: "60542"
  });
}

export default mainDirectorySampleData;