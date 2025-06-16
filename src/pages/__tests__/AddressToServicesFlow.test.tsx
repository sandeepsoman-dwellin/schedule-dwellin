import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, vi, expect, beforeEach } from 'vitest';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Hero from '@/components/Hero';
import ServicesList from '@/pages/ServicesList';
import { fetchServices } from '@/hooks/services/api';
import useGooglePlaces from '@/hooks/useGooglePlaces';

// Mock react-router-dom hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useSearchParams: vi.fn(), // Mock useSearchParams
  };
});

// Mock fetchServices
vi.mock('@/hooks/services/api', () => ({
  fetchServices: vi.fn(),
}));

// Mock useGooglePlaces
vi.mock('@/hooks/useGooglePlaces'); // Simplified, will provide mockReturnValue in test

const mockNavigate = useNavigate as vi.Mock;
const mockUseSearchParams = useSearchParams as vi.Mock;
const mockFetchServices = fetchServices as vi.Mock;
const mockUseGooglePlacesHook = useGooglePlaces as vi.Mock;

describe('AddressToServicesFlow', () => {
  let mockPlaceChangedCallback: (() => void) | null = null;
  const mockAutocompleteRef = {
    current: null as google.maps.places.Autocomplete | null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPlaceChangedCallback = null;

    // Reset the ref for each test if needed, though useGooglePlaces mock controls its behavior
    mockAutocompleteRef.current = null;

    // Setup the comprehensive mock for useGooglePlaces before each test
    const mockGetPlaceDetails = vi.fn().mockResolvedValue({
      address_components: [
        { long_name: '123 Main Street', types: ['street_number', 'route'] },
        { long_name: 'Testville', types: ['locality'] },
        { long_name: 'Testvania', types: ['administrative_area_level_1'] },
        { long_name: '12345', types: ['postal_code'] },
        { long_name: 'USA', types: ['country'] },
      ],
      geometry: { location: { lat: () => 34.0522, lng: () => -118.2437 } },
      // formatted_address: '123 Main St, Testville, Testvania 12345, USA',
    });

    const mockAutocompleteInstance = {
      addListener: vi.fn((eventName, callback) => {
        if (eventName === 'place_changed') {
          mockPlaceChangedCallback = callback;
        }
      }),
      getPlace: vi.fn().mockReturnValue({
        place_id: 'mock-place-id-123',
        name: '123 Main St', // This is often the input text or a selection
        // Other properties might be here depending on what AddressSearch uses
        // before calling getPlaceDetails. For this test, place_id is key.
      }),
      // Add any other methods that might be called on the autocomplete instance
      // For example, if AddressSearch calls setFields, getFields, etc.
      // setFields: vi.fn(),
    };

    mockUseGooglePlacesHook.mockReturnValue({
      placesLoaded: true,
      setupPlaceAutocomplete: vi.fn((inputRef, _onPlaceSelectedCallback, _options) => {
        // This mock now more closely resembles how AddressSearch might use it.
        // It receives the inputRef and a callback.
        // It should return the autocomplete instance.
        // The _onPlaceSelectedCallback is what AddressSearch provides.
        // We will simulate Google's API calling our mockPlaceChangedCallback.
        mockAutocompleteRef.current = mockAutocompleteInstance as any;
        return mockAutocompleteInstance;
      }),
      getPlaceDetails: mockGetPlaceDetails,
      // selectedAddress and setSelectedAddress are not strictly needed if the flow
      // relies on getPlaceDetails providing the zip, but mock them if AddressSearch uses them.
      selectedAddress: null,
      setSelectedAddress: vi.fn(),
      error: null,
    });
  });

  it('should navigate to services page with zip code and display filtered services', async () => {
    // 1. Render Hero component (which contains AddressSearch)
    // The useGooglePlaces mock is already set up in beforeEach
    render(<Hero />);

    // 2. Simulate user typing an address in AddressInput (used by AddressSearch)
    const addressInput = screen.getByPlaceholderText('Enter your address');
    expect(addressInput).toBeInTheDocument();
    fireEvent.change(addressInput, { target: { value: '123 Main St' } });

    // At this point, AddressSearch should have called setupPlaceAutocomplete,
    // which sets up the 'place_changed' listener.

    // 3. Simulate selecting a place from suggestions
    // This will trigger the 'place_changed' event.
    // AddressSearch's onPlaceChanged (or equivalent handler) should then:
    //    a. Call autocomplete.getPlace()
    //    b. Call getPlaceDetails(place.place_id, ...)
    //    c. Call its own onPlaceSelected callback, which then calls navigate.
    expect(mockPlaceChangedCallback).not.toBeNull();
    if (mockPlaceChangedCallback) {
      // This simulates Google Maps API triggering the event after a selection
      mockPlaceChangedCallback();
    }

    // Retrieve the mocked functions from the useGooglePlaces mock for assertion
    const { setupPlaceAutocomplete, getPlaceDetails } = mockUseGooglePlacesHook();
    const mockAutocompleteInstance = (setupPlaceAutocomplete as vi.Mock).mock.results[0].value;


    // Verify getPlace() was called on the autocomplete instance
    await waitFor(() => {
      expect(mockAutocompleteInstance.getPlace).toHaveBeenCalled();
    });

    // Verify getPlaceDetails was called (by AddressSearch after getPlace)
    // The arguments to getPlaceDetails depend on AddressSearch implementation.
    // Assuming it passes place_id and possibly other details from getPlace().
    await waitFor(() => {
      expect(getPlaceDetails).toHaveBeenCalledWith(
        'mock-place-id-123', // from mockAutocompleteInstance.getPlace()
        expect.any(Function) // The callback to process details
      );
    });

    // 4. Verify navigation
    // The navigate call happens inside the callback passed to getPlaceDetails by AddressSearch
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/services?zip=12345');
    });

    // --- ServicesList Page Flow ---

    // 5. Mock useSearchParams for ServicesList to simulate URL query params
    // This simulates being on /services?zip=12345
    mockUseSearchParams.mockReturnValue([new URLSearchParams('zip=12345')]);

    // 6. Mock fetchServices return value for the ServicesList component
    const allServices = [
      { id: '1', name: 'Service A (Correct Zip)', zip_code: '12345', service_type: 'typeA', description: 'descA' },
      { id: '2', name: 'Service B (Global)', zip_code: null, service_type: 'typeB', description: 'descB' },
      { id: '3', name: 'Service C (Wrong Zip)', zip_code: '67890', service_type: 'typeC', description: 'descC' },
      { id: '4', name: 'Service D (Correct Zip)', zip_code: '12345', service_type: 'typeD', description: 'descD' },
    ];
    mockFetchServices.mockResolvedValue(allServices);

    // 7. Render ServicesList component
    render(<ServicesList />);

    // 8. Assert fetchServices was called with the correct zip code
    await waitFor(() => {
      expect(mockFetchServices).toHaveBeenCalledWith('12345');
    });

    // 9. Assert that only the services corresponding to the zip code (and globally available services) are displayed
    await waitFor(() => {
      expect(screen.getByText('Service A (Correct Zip)')).toBeInTheDocument();
      expect(screen.getByText('Service B (Global)')).toBeInTheDocument();
      expect(screen.getByText('Service D (Correct Zip)')).toBeInTheDocument();
      expect(screen.queryByText('Service C (Wrong Zip)')).not.toBeInTheDocument();
    });
  });
});
