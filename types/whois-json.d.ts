declare module "whois-json" {
  export default function whois(
    domain: string,
    opts?: Record<string, unknown>
  ): Promise<Record<string, string>>;
}
