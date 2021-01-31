const S = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const generateRandomString = (n = 32) => {
  return Array.from(Array(n))
    .map(() => S[Math.floor(Math.random() * S.length)])
    .join('');
};

export default generateRandomString;
