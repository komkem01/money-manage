/**
 * Utility functions for handling BigInt serialization
 */

/**
 * แปลง BigInt ใน object เป็น string เพื่อใช้กับ JSON.stringify
 * @param {Object} obj - Object ที่อาจมี BigInt
 * @returns {Object} Object ที่แปลง BigInt เป็น string แล้ว
 */
const serializeBigInt = (obj) => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'bigint') {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  }

  if (typeof obj === 'object') {
    const serialized = {};
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeBigInt(value);
    }
    return serialized;
  }

  return obj;
};

/**
 * JSON.stringify แบบที่รองรับ BigInt
 * @param {any} obj - Object ที่จะ stringify
 * @param {function} replacer - Replacer function (optional)
 * @param {number} space - Indentation space (optional)
 * @returns {string} JSON string
 */
const stringifyWithBigInt = (obj, replacer = null, space = null) => {
  return JSON.stringify(serializeBigInt(obj), replacer, space);
};

/**
 * แปลง timestamp fields ใน user object
 * @param {Object} user - User object จาก database
 * @returns {Object} User object ที่แปลง timestamp เป็น string
 */
const serializeUser = (user) => {
  if (!user) return user;

  const { created_at, updated_at, deleted_at, ...rest } = user;
  
  return {
    ...rest,
    created_at: created_at ? created_at.toString() : null,
    updated_at: updated_at ? updated_at.toString() : null,
    deleted_at: deleted_at ? deleted_at.toString() : null,
  };
};

/**
 * ลบ password และแปลง BigInt ใน user object
 * @param {Object} user - User object จาก database
 * @returns {Object} User object ที่ปลอดภัยสำหรับส่ง response
 */
const sanitizeUser = (user) => {
  if (!user) return user;

  const { password, ...userWithoutPassword } = user;
  return serializeUser(userWithoutPassword);
};

module.exports = {
  serializeBigInt,
  stringifyWithBigInt,
  serializeUser,
  sanitizeUser,
};