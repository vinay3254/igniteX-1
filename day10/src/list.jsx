import PropTypes from 'prop-types';

function List({ category, items }) {
  if (!items.length) {
    return null;
  }

  const listItems = items.map((item) => (
    <li key={item.id} className="list-item">
      <span>{item.name}</span>
      <b>{item.calories} cal</b>
    </li>
  ));

  return (
    <div className="list-card">
      <h3>{category}</h3>
      <ol>{listItems}</ol>
    </div>
  );
}

List.propTypes = {
  category: PropTypes.string,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      calories: PropTypes.number.isRequired,
    }),
  ),
};

List.defaultProps = {
  category: 'Items',
  items: [],
};

export default List;
