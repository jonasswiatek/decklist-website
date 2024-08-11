import '../../App.scss'

export function EventList() {
  //const { loadEvents, events, logout } = useDecklistStore();

  return (
    <div className="py-3 py-md-5">
        <div className='container'>
            <div className='row'>
                <div className='col'>
                    <p>new events</p>
                </div>
            </div>
            <div className='row'>
                <div className='col'>
                    <p>List of events</p>
                </div>
            </div>
        </div>
    </div>
  )
}