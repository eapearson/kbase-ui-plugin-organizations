import React from 'react'
import { configure, shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

import { AppState, SortDirection } from '../types';

import Organizations from './Organizations'
import OrganizationsBrowser, { OrganizationsBrowserProps } from './OrganizationsBrowser';


configure({ adapter: new Adapter() })


/*
export interface OrganizationsBrowserProps {
 totalCount: number;
    filteredCount: number;
    sortBy: string;
    sortDirection: SortDirection;
    filter: string;
    searching: boolean;
    onSearchOrgs: (searchTerms: Array<string>) => void;
    onSortOrgs: (sortBy: string, sortDirection: SortDirection) => void;
    onFilterOrgs: (filter: string) => void;
}

export interface OrganizationsBrowserState {
    searchInput: string
}
*/

it('renders without crashing', () => {
    const props: OrganizationsBrowserProps = {
        totalCount: 0,
        filteredCount: 0,
        sortBy: '',
        sortDirection: SortDirection.ASCENDING,
        filter: '',
        searching: false,
        onSearchOrgs: (searchTerms: Array<string>) => { },
        onSortOrgs: (sortBy: string, sortDirection: SortDirection) => { },
        onFilterOrgs: (filter: string) => { }

    }

    const wrapper = shallow(<OrganizationsBrowser
        totalCount={props.totalCount}
        filteredCount={props.filteredCount}
        sortBy={props.sortBy}
        sortDirection={props.sortDirection}
        filter={props.filter}
        searching={props.searching}
        onSearchOrgs={props.onSearchOrgs}
        onSortOrgs={props.onSortOrgs}
        onFilterOrgs={props.onFilterOrgs}
    />)

});