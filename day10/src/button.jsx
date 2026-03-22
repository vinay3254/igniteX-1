import styles from './Button/Button.module.css';

function Button() {
  return (
    <button className={styles.button} type="button">
      Click me
    </button>
  );
}

export default Button;
