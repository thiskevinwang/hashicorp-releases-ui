export interface Build {
  name: string;
  version: string;
  os: string;
  arch: string;
  filename: string;
  url: string;
}

export interface Versions {
  [key: string]: VersionObject;
}

export interface VersionObject {
  name: string;
  version: string;
  shasums: string;
  shasums_signature: string;
  shasums_signatures: string[];
  builds: Build[];
}

export interface Release {
  name: string;
  versions: Versions;
}

export interface Releases {
  [key: string]: Release;
}
