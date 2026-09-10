const pool = require("../db");

const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;

      // Fetch user permissions
      const { rows: Permissions } = await pool.query(
        `SELECT p.name FROM user_roles ur
        JOIN role_perms rs ON ur.role_id = rs.role_id
        JOIN permissions p ON rs.permission_id = p.id
        WHERE ur.user_id = $1`,
        [userId]
      );

      const userPermissions = Permissions.map(p => p.name);

      if (!userPermissions.includes(requiredPermission)) {
        return res.status(403).json({ message: "Access Denied" });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
};

module.exports = { checkPermission };