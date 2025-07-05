const handleSubmit = async (e) => {
  e.preventDefault();

  const userData = {
    name,
    email,
    password,
    fitnessLevel,
  };

  try {
    const result = await registerUser(userData);
    console.log("Registration successful:", result);
    // redirect or show success
  } catch (err) {
    console.error("Registration failed:", err);
    // show error to user
  }
};