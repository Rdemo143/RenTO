exports.validateRegistration = (data) => {
    const { name, email, password, role } = data;
    const errors = [];
  
    if (!name || name.trim() === '') errors.push('Name is required.');
    if (!email || !/\S+@\S+\.\S+/.test(email)) errors.push('Valid email is required.');
    if (!password || password.length < 6) errors.push('Password must be at least 6 characters.');
    if (!role || !['owner', 'tenant'].includes(role)) errors.push('Role must be either "owner" or "tenant".');
  
    return errors.length > 0 ? { valid: false, errors } : { valid: true };
  };
  