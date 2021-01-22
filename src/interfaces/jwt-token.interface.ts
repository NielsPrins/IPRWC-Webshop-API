interface JwtToken {
  id: string,
  name: string,
  email: string,
  permission_group: string,
  fingerprint: string,
}

export default JwtToken;
