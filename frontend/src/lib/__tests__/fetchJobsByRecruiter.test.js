import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { readContract } from '@wagmi/core';
import { fetchStringDataOffChain } from '../fetching-offchain-data-utils';
import { fetchJobsByRecruiter } from '../fetching-onchain-data-utils';
import { JobStatus } from '@/constants/system';

// Mock the dependencies
jest.mock('@wagmi/core', () => ({
  readContract: jest.fn(),
}));

jest.mock('../fetching-offchain-data-utils', () => ({
  fetchStringDataOffChain: jest.fn(),
}));

describe('fetchJobsByRecruiter', () => {
  const mockAddress = '0x1234567890123456789012345678901234567890';
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('should return empty array when no jobs found', async () => {
    // Mock readContract to return empty array
    readContract.mockResolvedValue([]);

    const result = await fetchJobsByRecruiter(mockAddress);
    
    expect(result).toEqual([]);
    expect(readContract).toHaveBeenCalledTimes(1);
    expect(fetchStringDataOffChain).not.toHaveBeenCalled();
  });

  test('should transform raw job data correctly', async () => {
    // Mock date for testing
    const mockDate = new Date('2025-05-05');
    const mockTimestamp = mockDate.getTime();

    // Mock raw jobs returned from the blockchain
    const mockRawJobs = [
      {
        id: '1',
        recruiter: mockAddress,
        content_id: 'job1_content_id',
        created_at: mockTimestamp.toString(),
        status: JobStatus.OPEN,
      },
      {
        id: '2',
        recruiter: mockAddress,
        content_id: 'job2_content_id',
        created_at: mockTimestamp.toString(),
        status: JobStatus.PAUSED,
      }
    ];

    // Mock job content returned from Irys gateway
    const mockJobContent1 = JSON.stringify({
      title: 'Software Developer',
      location: 'Remote',
      type: 'Full-time',
      applicants: 10
    });

    const mockJobContent2 = JSON.stringify({
      title: 'Project Manager',
      location: 'New York',
      type: 'Contract',
      applicants: 5
    });

    // Setup mocks to return our test data
    readContract.mockResolvedValue(mockRawJobs);
    fetchStringDataOffChain.mockImplementation((url) => {
      if (url.includes('job1_content_id')) {
        return Promise.resolve(mockJobContent1);
      } else if (url.includes('job2_content_id')) {
        return Promise.resolve(mockJobContent2);
      }
      return Promise.resolve(null);
    });

    // Call the function under test
    const result = await fetchJobsByRecruiter(mockAddress);

    // Verify the results
    expect(result).toHaveLength(2);
    
    // Check first job
    expect(result[0]).toEqual({
      id: 1,
      title: 'Software Developer',
      location: 'Remote',
      type: 'Full-time',
      applicants: 10,
      posted: mockDate,
      status: JobStatus.OPEN
    });
    
    // Check second job
    expect(result[1]).toEqual({
      id: 2,
      title: 'Project Manager',
      location: 'New York',
      type: 'Contract',
      applicants: 5,
      posted: mockDate,
      status: JobStatus.PAUSED
    });

    // Verify function calls
    expect(readContract).toHaveBeenCalledTimes(1);
    expect(readContract).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        functionName: 'getJobsByRecruiter',
        args: [mockAddress]
      })
    );
    
    expect(fetchStringDataOffChain).toHaveBeenCalledTimes(2);
    expect(fetchStringDataOffChain).toHaveBeenCalledWith(
      'https://gateway.irys.xyz/mutable/job1_content_id'
    );
    expect(fetchStringDataOffChain).toHaveBeenCalledWith(
      'https://gateway.irys.xyz/mutable/job2_content_id'
    );
  });

  test('should handle missing job content properly', async () => {
    // Mock date for testing
    const mockDate = new Date('2025-05-05');
    const mockTimestamp = mockDate.getTime();

    // Mock raw jobs with one that will have no content
    const mockRawJobs = [
      {
        id: '3',
        recruiter: mockAddress,
        content_id: 'missing_content_id',
        created_at: mockTimestamp.toString(),
        status: JobStatus.DRAFT
      }
    ];

    // Setup mocks
    readContract.mockResolvedValue(mockRawJobs);
    fetchStringDataOffChain.mockResolvedValue(null); // Simulate missing content

    // Call the function under test
    const result = await fetchJobsByRecruiter(mockAddress);

    // Verify results
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 3,
      title: '',
      location: '',
      type: '',
      applicants: 0,
      posted: mockDate,
      status: JobStatus.DRAFT
    });
  });

  test('should handle malformed job content properly', async () => {
    // Mock date for testing
    const mockDate = new Date('2025-05-05');
    const mockTimestamp = mockDate.getTime();

    // Mock raw job
    const mockRawJobs = [
      {
        id: '4',
        recruiter: mockAddress,
        content_id: 'malformed_content_id',
        created_at: mockTimestamp.toString(),
        status: JobStatus.OPEN
      }
    ];

    // Setup mocks
    readContract.mockResolvedValue(mockRawJobs);
    fetchStringDataOffChain.mockResolvedValue('not-a-json-string'); // Simulate malformed content

    // Call the function under test with a malformed JSON response
    try {
      const result = await fetchJobsByRecruiter(mockAddress);
      // If we reach here, the function handled the error as expected
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 4,
        title: '',
        location: '',
        type: '',
        applicants: 0,
        posted: mockDate,
        status: JobStatus.OPEN
      });
    } catch (error) {
      // If we catch an error, the test should fail
      fail('Function did not handle malformed JSON gracefully');
    }
  });
});
