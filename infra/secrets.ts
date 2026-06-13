export const secrets = {
  stravaClientId: new sst.Secret("StravaClientId"),
  stravaClientSecret: new sst.Secret("StravaClientSecret"),
  sessionSecret: new sst.Secret("SessionSecret"),
  // Only needed if upgrading from OpenFreeMap (free, no key) to a paid tile provider
  maplibreTilesKey: new sst.Secret("MaplibreTilesKey"),
};
