import DatePicker from 'react-datepicker';
import styles from './DatePickerRange.module.css';

export default function DatePickerRange({ startDate, endDate, onChange }) {
  return (
    <div className={styles.container}>
      <DatePicker
        selected={startDate}
        onChange={(date) => onChange([date, endDate])}
        selectsStart
        startDate={startDate}
        endDate={endDate}
        dateFormat="dd/MM/yyyy"
        locale="pt-BR"
        placeholderText="Data Início"
        className={styles.dateInput}
      />
      <span className={styles.separator}>até</span>
      <DatePicker
        selected={endDate}
        onChange={(date) => onChange([startDate, date])}
        selectsEnd
        startDate={startDate}
        endDate={endDate}
        minDate={startDate}
        dateFormat="dd/MM/yyyy"
        locale="pt-BR"
        placeholderText="Data Fim"
        className={styles.dateInput}
      />
    </div>
  );
}