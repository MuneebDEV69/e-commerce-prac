function mockApiResponse() {
  return {
    success: true,
    message: "This is a mock response",
    data: {
      id: 1,
      name: "Test User"
    }
  };
}

// Usage
console.log(mockApiResponse());
console.log(mockApiResponse());