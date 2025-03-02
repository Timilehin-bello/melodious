// Network monitoring utility

type NetworkStrength = "good" | "medium" | "poor" | "offline";

class NetworkMonitor {
  private listeners: ((strength: NetworkStrength) => void)[] = [];
  private currentStrength: NetworkStrength = "good";
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Listen for online/offline events
    window.addEventListener("online", () => this.updateNetworkStrength());
    window.addEventListener("offline", () => {
      this.currentStrength = "offline";
      this.notifyListeners();
    });

    // Use the Network Information API if available
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener("change", () => this.updateNetworkStrength());
    }
  }

  // Start monitoring network conditions
  startMonitoring(checkIntervalMs = 10000): void {
    this.updateNetworkStrength();

    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(() => {
      this.updateNetworkStrength();
    }, checkIntervalMs);
  }

  // Stop monitoring
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Update the current network strength
  private async updateNetworkStrength(): Promise<void> {
    if (!navigator.onLine) {
      this.currentStrength = "offline";
      this.notifyListeners();
      return;
    }

    // Use the Network Information API if available
    const connection = (navigator as any).connection;
    if (connection) {
      switch (connection.effectiveType) {
        case "4g":
          this.currentStrength = "good";
          break;
        case "3g":
          this.currentStrength = "medium";
          break;
        case "2g":
        case "slow-2g":
          this.currentStrength = "poor";
          break;
        default:
          // Fallback to measuring download speed
          await this.measureConnectionSpeed();
      }
    } else {
      // Fallback to measuring download speed
      await this.measureConnectionSpeed();
    }

    this.notifyListeners();
  }

  // Measure connection speed by downloading a small test file
  private async measureConnectionSpeed(): Promise<void> {
    try {
      const startTime = Date.now();
      // Use a small image or file to test download speed
      const response = await fetch("/api/network-test", { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Network test failed");
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Determine network strength based on response time
      if (duration < 300) {
        this.currentStrength = "good";
      } else if (duration < 1000) {
        this.currentStrength = "medium";
      } else {
        this.currentStrength = "poor";
      }
    } catch (error) {
      console.error("Error measuring connection speed:", error);
      // Default to medium if we can't measure
      this.currentStrength = "medium";
    }
  }

  // Get the current network strength
  getCurrentStrength(): NetworkStrength {
    return this.currentStrength;
  }

  // Add a listener for network strength changes
  addListener(callback: (strength: NetworkStrength) => void): void {
    this.listeners.push(callback);
    // Immediately notify with current strength
    callback(this.currentStrength);
  }

  // Remove a listener
  removeListener(callback: (strength: NetworkStrength) => void): void {
    const index = this.listeners.indexOf(callback);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }

  // Notify all listeners of the current network strength
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      listener(this.currentStrength);
    });
  }
}

// Create a singleton instance
const networkMonitor = new NetworkMonitor();

export default networkMonitor;
