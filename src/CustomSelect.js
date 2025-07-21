import React, { useEffect, useState } from 'react';

const CustomSelect = ({ options, selected, setSelected, name, id, unit }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getMaxAllowedValue = (unit) => {
    switch (unit) {
      case 'лет': return 2;
      case 'месяцев': return 12;
      case 'дней': return 30;
      case 'недель': return 10;
      default: return Infinity;
    }
  };

  const handleSelect = (option) => {
    if (name === 'number') {
      const max = getMaxAllowedValue(unit);
      const value = parseInt(option);
      if (value <= max) {
        setSelected(option);
      } else {
        setSelected(String(max));
      }
    } else {
      setSelected(option);
    }
    setIsOpen(false);
  };

  return (
    <div className="custom-select-container">
      <div
        className={`select-selected ${isOpen ? 'select-arrow-active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        id={id}
      >
        {selected}
      </div>
      {isOpen && (
        <div className="select-items">
          <div className="select-items-list">
            {options
              .filter((option) => {
                if (name !== 'number') return true;
                const max = getMaxAllowedValue(unit);
                return parseInt(option) <= max;
              })
              .map((option, index) => (
                <div
                  key={index}
                  data-value={option}
                  className={option === selected ? 'same-as-selected' : ''}
                  onClick={() => handleSelect(option)}
                >
                  {option}
                </div>
              ))}
          </div>
        </div>
      )}
      <input type="hidden" name={name} value={selected} />
    </div>
  );
};

export default CustomSelect;
