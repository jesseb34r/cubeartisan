import React from 'react';

import AgeText from './AgeText';

class DeckPreview extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const deck = this.props.deck;
    return (
      <a className="no-underline-hover" href={'/cube/deck/' + deck._id}>
        <div className="border-top pb-2 pt-3 px-2 deck-preview">
          {
            deck.name.length <= 30 ?
            <h6 className="card-subtitle mb-2 text-muted">
              <a href={'/cube/deck/' + deck._id}>
                {deck.name}
              </a>
              {' by '}
              {deck.owner ? <a href={'/user/view/' + deck.owner}>{deck.username}</a> : <a>Anonymous</a>}{' '}
              {' - '}
              <AgeText date={deck.date} />
            </h6>

            :
            <h6 className="card-subtitle mb-2 text-muted">
              {deck.owner ? <a href={'/user/view/' + deck.owner}>{deck.username}</a> : <a>Anonymous</a>}{' '}
              <a href={'/cube/deck/' + deck._id}>
                {'drafted '}
                {deck.cubename}
              </a>
              {' - '}
              <AgeText date={deck.date} />
            </h6>
          }
        </div>
      </a>
    );
  }
}

export default DeckPreview;
