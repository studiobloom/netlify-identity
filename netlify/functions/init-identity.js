exports.handler = async (event, context) => {
  // This function doesn't need to do anything specific
  // Its presence will prompt Netlify to enable Identity
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Identity initialized" })
  };
}; 