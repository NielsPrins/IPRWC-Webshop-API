const varIsSet = (variable: any) => {
  if (typeof variable === 'undefined') {
    return false;
  }

  if (Array.isArray(variable)) {
    for (const v of variable) {
      if (!varIsSet(v)) {
        return false;
      }
    }
    return true;
  }

  return variable !== '';
};

export default varIsSet;
