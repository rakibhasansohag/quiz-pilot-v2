const ResponsiveWidthProvider = ({children}) => {

    //use it inside a section (immidiate child of a section)
    //section should provide necessary colors and this component should give the section a width

    return (
			<div className='w-11/12 md:w-10/12 mx-auto max-w-7xl'>{children}</div>
		);
};

export default ResponsiveWidthProvider;