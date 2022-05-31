export default FilterCollapse;
declare function FilterCollapse({ filter, setFilter, numCards, numShown, defaultFilterText, noCount, isOpen }: {
    filter: any;
    setFilter: any;
    numCards: any;
    numShown: any;
    defaultFilterText: any;
    noCount: any;
    isOpen: any;
}): JSX.Element;
declare namespace FilterCollapse {
    namespace propTypes {
        const filter: PropTypes.Requireable<(...args: any[]) => any>;
        const setFilter: PropTypes.Validator<(...args: any[]) => any>;
        const numCards: PropTypes.Requireable<number>;
        const numShown: PropTypes.Requireable<number>;
        const defaultFilterText: PropTypes.Requireable<string>;
        const noCount: PropTypes.Requireable<boolean>;
        const isOpen: PropTypes.Requireable<boolean>;
    }
    namespace defaultProps {
        const filter_1: null;
        export { filter_1 as filter };
        const numCards_1: number;
        export { numCards_1 as numCards };
        const numShown_1: number;
        export { numShown_1 as numShown };
        const defaultFilterText_1: null;
        export { defaultFilterText_1 as defaultFilterText };
        const noCount_1: boolean;
        export { noCount_1 as noCount };
        const isOpen_1: boolean;
        export { isOpen_1 as isOpen };
    }
}
import PropTypes from "prop-types";
//# sourceMappingURL=FilterCollapse.d.ts.map