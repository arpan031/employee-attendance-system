const calculateWorkingMinutes = (
  checkIn,
  checkOut
) => {
  if (!checkIn || !checkOut) {
    return 0;
  }

  return Math.floor(
    (new Date(checkOut) -
      new Date(checkIn)) /
      (1000 * 60)
  );
};

const calculateStatus = (checkIn) => {
  const date = new Date(checkIn);

  const hour = date.getHours();
  const minute = date.getMinutes();

  const totalMinutes =
    hour * 60 + minute;

  const officeStart = 9 * 60;

  if (totalMinutes <= officeStart) {
    return "Present";
  }

  if (totalMinutes <= officeStart + 30) {
    return "Late";
  }

  return "Late";
};

const calculateOvertime = (workingMinutes) => {
  const standardMinutes = 8 * 60;

  return Math.max(
    0,
    workingMinutes - standardMinutes
  );
};

module.exports = {
  calculateWorkingMinutes,
  calculateStatus,
  calculateOvertime,
};
