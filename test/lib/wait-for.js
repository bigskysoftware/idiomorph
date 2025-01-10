async function waitFor(condition) {
  return new Promise((resolve, reject) => {
    const check = async () => {
      try {
        if (condition() === true) {
          resolve();
        } else {
          setTimeout(check, 20);
        }
      } catch (error) {
        reject(error);
      }
    };
    check();
  });
}

