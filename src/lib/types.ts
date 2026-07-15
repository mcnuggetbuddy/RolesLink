export interface Person {
  id: string;
  name: string;
  exceptions: string[]; // role IDs this person cannot be assigned to
}

export interface RoleSection {
  id: string;
  label: string;
}

export interface Role {
  id: string;
  label: string;
  sectionId: string;
  allowMultiple?: boolean;
  highlight?: boolean;
}

export interface ServiceEvent {
  id: string;
  date: string; // YYYY-MM-DD
  assignments: Record<string, string[]>; // roleId -> personIds
}

