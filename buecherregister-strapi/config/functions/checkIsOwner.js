const checkIsOwner = ({ code, isAuthenticated, user }) => {
  if (!isAuthenticated) return false;
  const username = user && user.username;
  return username === code;
};

module.exports = {
  checkIsOwner,
}