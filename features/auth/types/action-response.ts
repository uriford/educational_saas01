export interface ActionResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
}