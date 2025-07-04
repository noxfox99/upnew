import React, { useState, useRef, useEffect } from 'react';

const CustomSelect = ({ options, selected, setSelected, name, id }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSelect = (value) => {
    setSelected(value);
    setIsOpen(false);
  };

  return (
    <div className="custom-select" ref={ref}>
      <div
        className={`select-selected ${isOpen ? 'select-arrow-active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected}
      </div>
      <div className={`select-items ${!isOpen ? 'select-hide' : ''}`}>
        <div className="select-items-list">
          {options.map((opt) => (
            <div
              key={opt}
              data-value={opt}
              className={opt === selected ? 'same-as-selected' : ''}
              onClick={() => handleSelect(opt)}
            >
              {opt}
            </div>
          ))}
        </div>
      </div>
      <input type="hidden" name={name} id={id} value={selected} />
    </div>
  );
};

export default CustomSelect;
