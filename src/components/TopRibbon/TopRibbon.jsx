
import './TopRibbon.css'


function TopRibbon() {
  return (
    <div className="top-ribbon">
    <div className="ribbon-inner">
    <div className="ribbon-group"> 

  <div className="ribbon-buttons">
    <div className="ribbon-btn">
      <div className="icon icon-violations"></div>
      <div className="label">Manage Violations</div>
    </div>


    <div className="ribbon-btn">
      <div className="icon icon-lateassmt"></div>
      <div className="label">Manage<br />Late Assmt</div>
    </div>
  </div>

  <div className="group-label">VIOLATIONS</div>
</div>
    </div>

  <div className="ribbon-group">
  <div className="ribbon-buttons">
    <div className="ribbon-btn">
      <div className="icon icon-arrears"></div>
      <div className="label">Manage Arrears</div>
    </div>
  </div>

  <div className="group-label">
    ARREARS
  </div>
  {/* End ARREARS ribbon-group  */}
</div> 

<div className="ribbon-group">
  <div className="ribbon-buttons">
    <div className="ribbon-btn">
      <div className="icon icon-summarize"></div>
      <div className="label">Summarize A/R Aging</div>
    </div>

    <div className="ribbon-btn">
      <div className="icon icon-archive-ar"></div>
      <div className="label">Archive<br />AR</div>
    </div>
  </div>

  <div className="group-label">
    ACCOUNTS RECEIVABLE
  </div>
</div>


<div className="ribbon-group">
  <div className="ribbon-buttons">
    <div className="ribbon-btn">
      <div className="icon icon-addressbook"></div>
      <div className="label">All Residents</div>
    </div>

    <div className="ribbon-btn">
      <div className="icon icon-showdetailspage"></div>
      <div className="label">Select 1 Resident</div>
    </div>
  </div>

  <div className="group-label">
    RESIDENTS ACTIVITY<br />REPORTS
  </div>
</div>


<div className="ribbon-group">
  <div className="ribbon-buttons">
    <div className="ribbon-btn">
      <div className="icon icon-accesslistcontacts"></div>
      <div className="label">SEARCH IDs</div>
    </div>
  </div>

  <div className="group-label">
    RESIDENT<br />ACCT&nbsp;&nbsp;ID
  </div>
</div>


<div className="ribbon-group">
  <div className="ribbon-buttons">
    <div className="ribbon-btn ribbon-btn-daily-deposit">
      <div className="icon icon-reviewacceptchange"></div>
      <div className="label">VERIFY<br />DEPOSIT</div>
    </div>
  </div>

  <div className="group-label">
    DAILY DEPOSIT<br />SLIP CHECK
  </div>
</div>


<div className="ribbon-group">
  <div className="ribbon-buttons">
    <div className="ribbon-btn">
      <div className="icon icon-addresident"></div>
      <div className="label">Add Resident</div>
    </div>

    <div className="ribbon-btn">
      <div className="icon icon-editresident"></div>
      <div className="label">Edit Resident</div>
    </div>
  </div>

  <div className="group-label">
    MAIN DIRECTORY
  </div>
</div>


<div className="ribbon-group">
  <div className="ribbon-buttons">

    <div className="ribbon-btn">
      <div className="icon icon-addvendor"></div>
      <div className="label">Add Vendor</div>
    </div>

    <div className="ribbon-btn">
      <div className="icon icon-editvendor"></div>
      <div className="label">Edit Vendor</div>
    </div>

    <div className="ribbon-btn">
      <div className="icon icon-deletevendor"></div>
      <div className="label">Delete Vendor</div>
    </div>

  </div>

  <div className="group-label">
    VENDOR ID
  </div>
</div>

<div className="ribbon-group">
  <div className="ribbon-buttons">
    <div className="ribbon-btn">
      <div className="icon icon-newyearinvoices"></div>
      <div className="label">
        New Year<br />Invoices
      </div>
    </div>
  </div>

  <div className="group-label">
    NEW YEAR<br />INVOICES
  </div>
</div>





<div className="ribbon-group">
  <div className="ribbon-buttons">

    <div className="ribbon-btn ribbon-btn-master">
      <div className="label label-master">
        Go To<br />
        Master Nav<br />
        Panel
      </div>
    </div>

  </div>

  <div className="group-label">
    MASTER NAV
  </div>
</div>










{/* End ribbon-inner */}
  </div>

)
}

export default TopRibbon