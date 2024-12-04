import React from 'react';

function DropdownComponent({ selectedFilters, onFilterToggle }) {
    return (
        <div className="absolute mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg">
            <div className="px-4 py-2 text-gray-700">
                <div className="space-y-2">
                    {['lunch', 'dinner', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((filter) => (
                        <div key={filter}>
                            <label className="block">
                                <input
                                    type="checkbox"
                                    value={filter}
                                    checked={selectedFilters.includes(filter)}
                                    onChange={() => onFilterToggle(filter)}
                                    className="mr-2"
                                />
                                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default DropdownComponent;
