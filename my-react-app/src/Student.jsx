import PropTypes from 'prop-types'

function Student(props) {
    return (
        <div className="Student">
            <p>Name: {props.name}</p>
            <p>Age: {props.age}</p>  {/* ✅ lowercase 'age' */}
            <p>Student: {props.isStudent ? "yes" : "no"}</p>
        </div>
    );
}

Student.propTypes = {
    name: PropTypes.string,
    age: PropTypes.number,
    isStudent: PropTypes.bool,
}

Student.defaultProps = {
    name: "Guest",
    age: 0,
    isStudent: true,
}

export default Student