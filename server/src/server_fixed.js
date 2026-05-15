
const addDriverContactColumn = async () => {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const tableInfo = await queryInterface.describeTable(" Trips\);
 if (!tableInfo.driverContact) {
 console.log(\?? Adding missing column \\driverContact\\ to Trips...\);
 await queryInterface.addColumn(\Trips\, \driverContact\, {
 type: DataTypes.STRING,
 allowNull: true,
 });
 console.log(\? Column \\driverContact\\ added successfully\);
 }
 } catch (err) {
 console.log(\?? driverContact migration note:\, err.message);
 }
};
addDriverContactColumn();

