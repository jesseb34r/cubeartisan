import React from 'react';
import PropTypes from 'prop-types';
import { InputLabel, MenuItem, Select } from '@mui/material';

const LabeledSelect = ({ label, baseId, values, value, setValue, labelSx, selectSx, keys }) => (
  <>
    <InputLabel id={`${baseId}-label`} sx={labelSx}>
      {label}
    </InputLabel>
    <Select
      labelId={`${baseId}-label`}
      id={`${baseId}-select`}
      value={value}
      label={label}
      onChange={(event) => setValue(event.target.value)}
      sx={selectSx}
    >
      {values.map((item, idx) => (
        <MenuItem key={keys ? keys[idx] : item} value={keys ? keys[idx] : item}>
          {item}
        </MenuItem>
      ))}
    </Select>
  </>
);
LabeledSelect.propTypes = {
  label: PropTypes.string.isRequired,
  baseId: PropTypes.string.isRequired,
  values: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  value: PropTypes.string,
  setValue: PropTypes.func.isRequired,
  labelSx: PropTypes.shape({}),
  selectSx: PropTypes.shape({}),
  keys: PropTypes.arrayOf(PropTypes.string.isRequired),
};
LabeledSelect.defaultProps = {
  value: null,
  labelSx: {},
  selectSx: { marginY: 1 },
  keys: null,
};
export default LabeledSelect;
