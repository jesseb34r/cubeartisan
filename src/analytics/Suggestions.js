import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { csrfFetch } from 'utils/CSRF';
import FilterCollapse from 'components/FilterCollapse';
import withAutocard from 'components/WithAutocard';
import Filter from 'utils/Filter';
import { encodeName } from 'utils/Card';
import PagedList from 'components/PagedList';

import { Col, Row, ListGroup, ListGroupItem, ListGroupItemHeading, Card, CardBody, CardHeader } from 'reactstrap';

const AutocardA = withAutocard('a');

const Suggestion = ({ card, index }) => {
  return (
    <ListGroupItem>
      <h6>
        {index + 1}
        {'. '}
        <AutocardA
          front={card.details.image_normal}
          back={card.details.image_flip || undefined}
          href={`/tool/card/${encodeName(card.cardID)}`}
        >
          {card.details.name}
        </AutocardA>
      </h6>
    </ListGroupItem>
  );
};

Suggestion.propTypes = {
  card: PropTypes.shape({
    cardID: PropTypes.string.isRequired,
    details: PropTypes.shape({
      image_normal: PropTypes.string.isRequired,
      image_flip: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
};

const Suggestions = ({ cards, cube }) => {
  const [filter, setFilter] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [removes, setRemoves] = useState([]);
  const [adds, setAdds] = useState([]);
  const [cuts, setCuts] = useState([]);

  async function getData(url = '', data = {}) {
    // Default options are marked with *
    const response = await csrfFetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    const val = await response.json(); // parses JSON response into native JavaScript objects
    return val.result;
  }

  const updateFilter = (val) => {
    setFilter(val);
    setAdds(suggestions.filter((card) => Filter.filterCard(card, val)));
    setCuts(removes.filter((card) => Filter.filterCard(card, val)));
  };

  useEffect(() => {
    getData(`/cube/api/adds/${cube._id}`, { cards: cards.map((card) => card.details.name) }).then(
      ({ toCut, toAdd }) => {
        setSuggestions(toAdd);
        setRemoves(toCut);
        setAdds(toAdd);
        setCuts(toCut);
        setLoading(false);
      },
    );
  }, [adds, cards, cube._id, cuts]);

  console.log(adds);

  return (
    <>
      <h4 className="d-lg-block d-none">Recommender</h4>
      <p>
        View recommended additions and cuts. This data is generated using a machine learning algorithm trained over all
        cubes on Cube Cobra.
      </p>

      <FilterCollapse
        defaultFilterText=""
        filter={filter}
        setFilter={updateFilter}
        numCards={cards.length}
        isOpen
        noCount
      />
      <Row>
        <Col xs="12" lg="6">
          <Card>
            <CardHeader>
              <ListGroupItemHeading>Recommended Additions</ListGroupItemHeading>
            </CardHeader>
            <CardBody>
              <ListGroup>
                {loading && <em>Loading...</em>}
                {!loading &&
                  (adds.length > 0 ? (
                    <PagedList
                      pageSize={20}
                      rows={adds.slice(0).map((add, index) => (
                        <Suggestion key={add.cardID} index={index} card={add} />
                      ))}
                    />
                  ) : (
                    <em>No results with the given filter.</em>
                  ))}
              </ListGroup>
            </CardBody>
          </Card>
        </Col>
        <Col xs="12" lg="6">
          <Card>
            <CardHeader>
              <ListGroupItemHeading>Recommended Cuts</ListGroupItemHeading>
            </CardHeader>
            <CardBody>
              <ListGroup>
                {loading && <em>Loading...</em>}
                {!loading &&
                  (cuts.length > 0 ? (
                    <PagedList
                      pageSize={20}
                      rows={cuts.slice(0).map((add, index) => (
                        <Suggestion key={add.cardID} index={index} card={add} />
                      ))}
                    />
                  ) : (
                    <em>No results with the given filter.</em>
                  ))}
              </ListGroup>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

Suggestions.propTypes = {
  cube: PropTypes.shape({
    cards: PropTypes.arrayOf(PropTypes.shape({})),
    draft_formats: PropTypes.arrayOf(PropTypes.shape({})),
    _id: PropTypes.string.isRequired,
  }).isRequired,
  cards: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default Suggestions;
