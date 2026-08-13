export type UserRole = "SUPER_ADMIN" | "NETWORK_ENGINEER" | "AUDITOR" | "GUEST";

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  email: string;
  avatar: string;
  status: "active" | "disabled";
  lastLogin: string;
  ip: string;
}

export type DeviceStatus = "online" | "offline" | "fault" | "warning";
export type DeviceType = "Router" | "Switch" | "Firewall" | "Wireless_AP" | "Load_Balancer" | "Gateway";
export type VendorType = "Huawei" | "Cisco" | "H3C" | "Juniper" | "Ruijie" | "F5";

export interface InterfacePort {
  id: string;
  name: string; // e.g. GigabitEthernet0/0/1
  speed: string; // 1000Mbps
  status: "up" | "down";
  vlan?: number;
  trafficRx: string;
  trafficTx: string;
}

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  vendor: VendorType;
  model: string;
  ip: string;
  mac: string;
  location: string;
  status: DeviceStatus;
  group: string;
  firmwareVersion: string;
  cpuUsage: number; // percentage
  memoryUsage: number; // percentage
  uptime: string;
  configStatus: "synced" | "pending" | "failed";
  lastSyncTime: string;
  portsCount: number;
  activePorts: number;
  ports?: InterfacePort[];
}

export interface ConfigTemplate {
  id: string;
  name: string;
  vendor: VendorType;
  deviceType: DeviceType;
  description: string;
  createdDate: string;
  updatedDate: string;
  status: "draft" | "active" | "archived";
  commands: string;
  variables: string[]; // e.g. ["VLAN_ID", "IP_ADDR", "SUBNET_MASK"]
  version: string;
  author: string;
}

export interface Firmware {
  id: string;
  version: string;
  vendor: VendorType;
  compatibleModels: string[];
  releaseDate: string;
  fileSize: string;
  checksum: string;
  status: "stable" | "beta" | "deprecated";
  description: string;
  downloadUrl: string;
  releaseNotes: string[];
}

export interface FirmwareUpdateLog {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceModel: string;
  fromVersion: string;
  toVersion: string;
  status: "success" | "in_progress" | "failed" | "rolled_back";
  operator: string;
  timestamp: string;
  details: string;
}

export interface EventLog {
  id: string;
  timestamp: string;
  deviceId: string;
  deviceName: string;
  level: "critical" | "warning" | "info";
  title: string;
  message: string;
  resolved: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  operator?: string;
  username?: string;
  userRole?: UserRole;
  clientIp?: string;
  ip?: string;
  actionType: string;
  module?: string;
  targetDevice?: string;
  target?: string;
  details: string;
  status?: "success" | "failed" | string;
  riskLevel?: "LOW" | "MEDIUM" | "HIGH";
}

export interface DeviceGroup {
  id: string;
  name: string;
  description: string;
  deviceCount: number;
  color: string;
}

export interface RolePermission {
  role: UserRole;
  roleName: string;
  description: string;
  permissions: {
    deviceManage: boolean;
    deviceDelete: boolean;
    configEdit: boolean;
    configApply: boolean;
    firmwareUpdate: boolean;
    userManage: boolean;
    auditView: boolean;
  };
}
