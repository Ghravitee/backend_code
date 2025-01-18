// controllers/codeValidationController.js

export const validateCode = (req, res) => {
  const { code } = req.body; // Get the code from the request body

  const VALID_CODE = "yourSecretCode123"; // Your predefined secret code

  // Compare the provided code with the valid code
  if (code === VALID_CODE) {
    return res.status(200).json({ message: "Access granted to health stats" });
  } else {
    return res.status(403).json({ message: "Forbidden: Invalid secret code" });
  }
};
