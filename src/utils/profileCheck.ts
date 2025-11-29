// src/utils/profileCheck.ts

export const getProfileCompletion = (user: any) => {
  if (!user) return false;

  // ⭐ REQUIRED FIELDS
  const required = [
    "image",
    "about_me",
    "profession",
    "education",
    "country",
    "state",         // city/state
    "gender",
    "marital_status",
    "age",
  ];

  return required.every((field) => {
    const value = user[field];
    console.log("-------->",value)
    return value !== null && value !== "" && value !== undefined;
  });
};
