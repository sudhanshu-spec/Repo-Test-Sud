/**
 * Unit Tests for Server Module
 * Tests isolated server module functions, configuration, and exports
 * 
 * @file tests/unit/server.test.js
 */

const {
  server,
  start,
  stop,
  getStatus,
  getConfig,
  resetDataStore,
  isValidPort,
  isValidHost,
  config
} = require('../../server');

describe('Server Module', () => {
  describe('Module Exports', () => {
    it('should export server instance', () => {
      expect(server).toBeDefined();
      expect(typeof server.listen).toBe('function');
      expect(typeof server.close).toBe('function');
    });

    it('should export start function', () => {
      expect(start).toBeDefined();
      expect(typeof start).toBe('function');
    });

    it('should export stop function', () => {
      expect(stop).toBeDefined();
      expect(typeof stop).toBe('function');
    });

    it('should export getStatus function', () => {
      expect(getStatus).toBeDefined();
      expect(typeof getStatus).toBe('function');
    });

    it('should export getConfig function', () => {
      expect(getConfig).toBeDefined();
      expect(typeof getConfig).toBe('function');
    });

    it('should export resetDataStore function', () => {
      expect(resetDataStore).toBeDefined();
      expect(typeof resetDataStore).toBe('function');
    });

    it('should export isValidPort function', () => {
      expect(isValidPort).toBeDefined();
      expect(typeof isValidPort).toBe('function');
    });

    it('should export isValidHost function', () => {
      expect(isValidHost).toBeDefined();
      expect(typeof isValidHost).toBe('function');
    });

    it('should export config object', () => {
      expect(config).toBeDefined();
      expect(typeof config).toBe('object');
    });
  });

  describe('isValidPort', () => {
    it('should return true for valid port 80', () => {
      expect(isValidPort(80)).toBe(true);
    });

    it('should return true for valid port 443', () => {
      expect(isValidPort(443)).toBe(true);
    });

    it('should return true for valid port 3000', () => {
      expect(isValidPort(3000)).toBe(true);
    });

    it('should return true for port 0 (ephemeral)', () => {
      expect(isValidPort(0)).toBe(true);
    });

    it('should return true for maximum valid port 65535', () => {
      expect(isValidPort(65535)).toBe(true);
    });

    it('should return false for negative port', () => {
      expect(isValidPort(-1)).toBe(false);
    });

    it('should return false for port greater than 65535', () => {
      expect(isValidPort(65536)).toBe(false);
    });

    it('should return false for non-integer port', () => {
      expect(isValidPort(3000.5)).toBe(false);
    });

    it('should return false for string port', () => {
      expect(isValidPort('3000')).toBe(false);
    });

    it('should return false for null port', () => {
      expect(isValidPort(null)).toBe(false);
    });

    it('should return false for undefined port', () => {
      expect(isValidPort(undefined)).toBe(false);
    });

    it('should return false for NaN port', () => {
      expect(isValidPort(NaN)).toBe(false);
    });
  });

  describe('isValidHost', () => {
    it('should return true for localhost', () => {
      expect(isValidHost('localhost')).toBe(true);
    });

    it('should return true for 127.0.0.1', () => {
      expect(isValidHost('127.0.0.1')).toBe(true);
    });

    it('should return true for 0.0.0.0', () => {
      expect(isValidHost('0.0.0.0')).toBe(true);
    });

    it('should return true for valid IP address', () => {
      expect(isValidHost('192.168.1.1')).toBe(true);
    });

    it('should return true for valid hostname', () => {
      expect(isValidHost('example.com')).toBe(true);
    });

    it('should return true for subdomain hostname', () => {
      expect(isValidHost('api.example.com')).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(isValidHost('')).toBe(false);
    });

    it('should return false for null', () => {
      expect(isValidHost(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isValidHost(undefined)).toBe(false);
    });

    it('should return false for number', () => {
      expect(isValidHost(123)).toBe(false);
    });

    it('should return false for invalid hostname with spaces', () => {
      expect(isValidHost('invalid host')).toBe(false);
    });

    it('should return false for hostname with special characters', () => {
      expect(isValidHost('host@name')).toBe(false);
    });
  });

  describe('Configuration', () => {
    it('should have default port value', () => {
      const conf = getConfig();
      expect(conf.port).toBeDefined();
      expect(typeof conf.port).toBe('number');
    });

    it('should have default host value', () => {
      const conf = getConfig();
      expect(conf.host).toBeDefined();
      expect(typeof conf.host).toBe('string');
    });

    it('should return a copy of config (not reference)', () => {
      const conf1 = getConfig();
      const conf2 = getConfig();
      conf1.port = 9999;
      expect(conf2.port).not.toBe(9999);
    });
  });

  describe('Server Status', () => {
    it('should return status object with listening property', () => {
      const status = getStatus();
      expect(status).toHaveProperty('listening');
      expect(typeof status.listening).toBe('boolean');
    });

    it('should return status object with connections property', () => {
      const status = getStatus();
      expect(status).toHaveProperty('connections');
      expect(typeof status.connections).toBe('number');
    });

    it('should return status object with address property', () => {
      const status = getStatus();
      expect(status).toHaveProperty('address');
    });

    it('should show not listening when server is not started', () => {
      const status = getStatus();
      expect(status.listening).toBe(false);
    });
  });

  describe('Data Store Reset', () => {
    it('should reset without errors', () => {
      expect(() => resetDataStore()).not.toThrow();
    });
  });
});
