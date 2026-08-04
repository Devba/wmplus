


import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import './FilterUF.css';

const DEFAULT_CHUNK_SIZE = 25;

/* =========================================================
   NORMALIZE LOOKUP DATA
   ========================================================= */

function residentAccountFor(resident) {
  return String(
    resident?.accountNumber ??
      resident?.acctNo ??
      resident?.acct ??
      ''
  ).trim();
}

function residentNameFor(resident) {
  if (resident?.displayName) {
    return String(resident.displayName).trim();
  }

  return [
    resident?.lastName || '',
    resident?.firstName || ''
  ]
    .filter(Boolean)
    .join(', ')
    .trim();
}

function residentAddressFor(resident) {
  return String(
    resident?.address ??
      resident?.residence ??
      ''
  ).trim();
}

function vendorAccountFor(vendor) {
  return String(
    vendor?.accountNumber ??
      vendor?.vendorId ??
      vendor?.vendorAcct ??
      vendor?.acct ??
      ''
  ).trim();
}

function vendorNameFor(vendor) {
  return String(
    vendor?.displayName ??
      vendor?.vendorName ??
      vendor?.name ??
      vendor?.payeeName ??
      ''
  ).trim();
}

function vendorAddressFor(vendor) {
  const directAddress = String(
    vendor?.address ??
      vendor?.vendorAddress ??
      vendor?.streetAddress ??
      ''
  ).trim();

  if (directAddress) {
    return directAddress;
  }

  return [
    vendor?.city || '',
    vendor?.state || vendor?.st || '',
    vendor?.zip || ''
  ]
    .filter(Boolean)
    .join(', ')
    .trim();
}

function normalizeResident(resident) {
  return {
    type: 'resident',
    accountNumber: residentAccountFor(resident),
    displayName: residentNameFor(resident),
    address: residentAddressFor(resident),
    source: resident
  };
}

function normalizeVendor(vendor) {
  return {
    type: 'vendor',
    accountNumber: vendorAccountFor(vendor),
    displayName: vendorNameFor(vendor),
    address: vendorAddressFor(vendor),
    source: vendor
  };
}

/* =========================================================
   LOCAL LOOKUP SUPPORT
   ========================================================= */

function sortByAccount(items) {
  return [...items].sort((a, b) =>
    String(a.accountNumber).localeCompare(
      String(b.accountNumber),
      undefined,
      { numeric: true }
    )
  );
}

function sortByName(items) {
  return [...items].sort((a, b) =>
    String(a.displayName).localeCompare(
      String(b.displayName)
    )
  );
}

function sortByAddress(items) {
  return [...items].sort((a, b) =>
    String(a.address).localeCompare(
      String(b.address),
      undefined,
      { numeric: true }
    )
  );
}

function buildLocalLookupLoader({
  residents,
  vendors
}) {
  const normalizedResidents = residents
    .map(normalizeResident)
    .filter((item) => item.accountNumber);

  const normalizedVendors = vendors
    .map(normalizeVendor)
    .filter((item) => item.accountNumber);

  return async function loadLocalLookupOptions({
    lookupType,
    searchText = '',
    cursor = null,
    limit = DEFAULT_CHUNK_SIZE
  }) {
    let sourceItems = [];

    if (lookupType === 'resident-account') {
      sourceItems = sortByAccount(normalizedResidents);
    }

    if (lookupType === 'resident-name') {
      sourceItems = sortByName(normalizedResidents);
    }

    if (lookupType === 'resident-address') {
      sourceItems = sortByAddress(normalizedResidents);
    }

    if (lookupType === 'vendor-name') {
      sourceItems = sortByName(normalizedVendors);
    }

    if (lookupType === 'vendor-account') {
      sourceItems = sortByAccount(normalizedVendors);
    }

    const normalizedSearch = String(searchText)
      .trim()
      .toLowerCase();

    const filteredItems = normalizedSearch
      ? sourceItems.filter((item) => {
          const searchableText = [
            item.displayName,
            item.address,
            item.accountNumber
          ]
            .join(' ')
            .toLowerCase();

          return searchableText.includes(
            normalizedSearch
          );
        })
      : sourceItems;

    const parsedCursor = Number(cursor);

    const startIndex =
      cursor !== null &&
      Number.isFinite(parsedCursor)
        ? parsedCursor
        : 0;

    const items = filteredItems.slice(
      startIndex,
      startIndex + limit
    );

    const nextIndex =
      startIndex + items.length;

    const hasMore =
      nextIndex < filteredItems.length;

    return {
      items,
      nextCursor: hasMore
        ? String(nextIndex)
        : null,
      hasMore
    };
  };
}

/* =========================================================
   LOOKUP DISPLAY
   ========================================================= */

function controlValueFor(item, lookupType) {
  if (!item) {
    return '';
  }

  if (
    lookupType === 'resident-account' ||
    lookupType === 'vendor-account'
  ) {
    return item.accountNumber;
  }

  if (lookupType === 'resident-address') {
    return item.address;
  }

  return item.displayName;
}

function LookupColumnHeader({ itemType }) {
  const isVendor = itemType === 'vendor';

  return (
    <div className="paged-lookup-header">
      <div className="lookup-col lookup-col-name">
        {isVendor
          ? 'VENDOR NAME'
          : 'RESIDENT NAME'}
      </div>

      <div className="lookup-col lookup-col-address">
        {isVendor
          ? 'VENDOR ADDRESS'
          : 'RESIDENT ADDRESS'}
      </div>

      <div className="lookup-col lookup-col-account">
        {isVendor
          ? 'VENDOR ID'
          : 'ACCOUNT #'}
      </div>
    </div>
  );
}

function LookupOption({
  item,
  onSelect
}) {
  const fullDescription = [
    item.displayName,
    item.address,
    item.accountNumber
  ]
    .filter(Boolean)
    .join(' | ');

  return (
    <button
      type="button"
      className="paged-lookup-option"
      onClick={() => onSelect(item)}
      title={fullDescription}
    >
      <span
        className="lookup-col lookup-col-name"
        title={item.displayName}
      >
        {item.displayName}
      </span>

      <span
        className="lookup-col lookup-col-address"
        title={item.address}
      >
        {item.address}
      </span>

      <span
        className="lookup-col lookup-col-account"
        title={item.accountNumber}
      >
        {item.accountNumber}
      </span>
    </button>
  );
}

/* =========================================================
   PAGED LOOKUP COMBO
   ========================================================= */

function PagedLookupCombo({
  className,
  lookupType,
  itemType,
  value,
  loadLookupOptions,
  onSelect,
  isOpen,
  onToggle,
  onClose
}) {
  const listRef = useRef(null);
  const loadingRef = useRef(false);
  const requestNumberRef = useRef(0);

  const [items, setItems] = useState([]);
  const [nextCursor, setNextCursor] =
    useState(null);
  const [hasMore, setHasMore] =
    useState(true);
  const [isLoading, setIsLoading] =
    useState(false);
  const [searchText, setSearchText] =
    useState('');

  const requestItems = useCallback(
    async ({
      reset = false,
      requestedCursor = null,
      requestedSearchText = ''
    } = {}) => {
      if (
        loadingRef.current &&
        !reset
      ) {
        return;
      }

      const requestNumber =
        requestNumberRef.current + 1;

      requestNumberRef.current =
        requestNumber;

      loadingRef.current = true;
      setIsLoading(true);

      try {
        const result =
          await loadLookupOptions({
            lookupType,
            searchText:
              requestedSearchText,
            cursor: reset
              ? null
              : requestedCursor,
            limit: DEFAULT_CHUNK_SIZE
          });

        if (
          requestNumber !==
          requestNumberRef.current
        ) {
          return;
        }

        const returnedItems =
          Array.isArray(result?.items)
            ? result.items
            : [];

        setItems((currentItems) =>
          reset
            ? returnedItems
            : [
                ...currentItems,
                ...returnedItems
              ]
        );

        setNextCursor(
          result?.nextCursor ?? null
        );

        setHasMore(
          Boolean(result?.hasMore)
        );
      } catch (error) {
        console.error(
          `Filter lookup failed: ${lookupType}`,
          error
        );

        window.alert(
          'The lookup choices could not be loaded.'
        );
      } finally {
        if (
          requestNumber ===
          requestNumberRef.current
        ) {
          loadingRef.current = false;
          setIsLoading(false);
        }
      }
    },
    [
      loadLookupOptions,
      lookupType
    ]
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setSearchText('');

    requestItems({
      reset: true,
      requestedSearchText: ''
    });
  }, [
    isOpen,
    lookupType,
    requestItems
  ]);

  const handleScroll = () => {
    const listElement =
      listRef.current;

    if (
      !listElement ||
      !hasMore ||
      isLoading ||
      !nextCursor
    ) {
      return;
    }

    const distanceFromBottom =
      listElement.scrollHeight -
      listElement.scrollTop -
      listElement.clientHeight;

    if (distanceFromBottom <= 35) {
      requestItems({
        requestedCursor: nextCursor,
        requestedSearchText:
          searchText
      });
    }
  };

  const handleSearchChange = (
    event
  ) => {
    const nextSearchText =
      event.target.value;

    setSearchText(nextSearchText);

    requestItems({
      reset: true,
      requestedSearchText:
        nextSearchText
    });
  };

  const handleSelect = (item) => {
    onSelect(item);
    onClose();
    setSearchText('');
  };

  return (
    <div
      className={`paged-lookup ${className}`}
    >
      <button
        type="button"
        className="paged-lookup-control"
        onClick={onToggle}
      >
        <span className="paged-lookup-value">
          {value}
        </span>

        <span className="paged-lookup-arrow">
          ▼
        </span>
      </button>

      {isOpen && (
        <div
          className={`paged-lookup-popup lookup-popup-${itemType}`}
        >
          <input
            type="text"
            className="paged-lookup-search"
            value={searchText}
            onChange={
              handleSearchChange
            }
            placeholder="Type to search"
            autoFocus
          />

          <LookupColumnHeader
            itemType={itemType}
          />

          <div
            ref={listRef}
            className="paged-lookup-list"
            onScroll={handleScroll}
          >
            {items.map(
              (item, index) => (
                <LookupOption
                  key={
                    `${lookupType}-` +
                    `${item.accountNumber}-` +
                    `${index}`
                  }
                  item={item}
                  onSelect={
                    handleSelect
                  }
                />
              )
            )}

            {!isLoading &&
              items.length === 0 && (
                <div className="paged-lookup-message">
                  No matching entries
                </div>
              )}

            {isLoading && (
              <div className="paged-lookup-message">
                Loading…
              </div>
            )}

            {!isLoading &&
              items.length > 0 &&
              !hasMore && (
                <div className="paged-lookup-message">
                  End of list
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   SHARED FILTER UF
   ========================================================= */

function FilterUF({
  page = '',
  pageLabel = 'REGISTER',

  showResidents = true,
  showVendors = false,

  residents = [],
  vendors = [],

  loadLookupOptions,

  onApplyFilter,
  onApplyResidentFilter,
  onApplyVendorFilter
}) {
  const [selectedItem, setSelectedItem] =
    useState(null);

  const [
    activeLookupType,
    setActiveLookupType
  ] = useState('');

  const [
    openLookupType,
    setOpenLookupType
  ] = useState('');

  const residentOnly =
    showResidents && !showVendors;

  const vendorOnly =
    !showResidents && showVendors;

  const mixedMode =
    showResidents && showVendors;

  const layoutClass = vendorOnly
    ? 'filter-mode-vendor-only'
    : residentOnly
      ? 'filter-mode-resident-only'
      : 'filter-mode-mixed';

  const localLookupLoader = useMemo(
    () =>
      buildLocalLookupLoader({
        residents,
        vendors
      }),
    [residents, vendors]
  );

  const effectiveLookupLoader =
    loadLookupOptions ||
    localLookupLoader;

  const handleLookupSelection = (
    item,
    lookupType
  ) => {
    setSelectedItem(item);
    setActiveLookupType(
      lookupType
    );
  };

  const handleToggleLookup = (
    lookupType
  ) => {
    setOpenLookupType(
      (currentLookupType) =>
        currentLookupType ===
        lookupType
          ? ''
          : lookupType
    );
  };

  const handleClear = () => {
    setSelectedItem(null);
    setActiveLookupType('');
    setOpenLookupType('');
  };

  const displayValueFor = (
    lookupType
  ) => {
    if (
      !selectedItem ||
      activeLookupType !==
        lookupType
    ) {
      return '';
    }

    return controlValueFor(
      selectedItem,
      lookupType
    );
  };

  const closeOverlay = () => {
    document
      .querySelector(
        '.overlay-close-btn, .overlay-close'
      )
      ?.click();
  };

  const handleApplyFilter =
    async () => {
      if (!selectedItem) {
        window.alert(
          vendorOnly
            ? 'Please select a vendor before applying the filter.'
            : mixedMode
              ? 'Please select a resident or vendor before applying the filter.'
              : 'Please select a resident before applying the filter.'
        );

        return;
      }

      const filterType =
        selectedItem.type ===
        'vendor'
          ? 'vendor'
          : 'resident';

      const request = {
        page,
        filterType,
        accountNumber:
          selectedItem.accountNumber,
        selectedItem,
        cursor: null,
        limit: 200
      };

      if (
        typeof onApplyFilter ===
        'function'
      ) {
        await onApplyFilter(request);
        closeOverlay();
        return;
      }

      if (
        filterType === 'resident' &&
        typeof onApplyResidentFilter ===
          'function'
      ) {
        await onApplyResidentFilter(
          selectedItem.accountNumber
        );

        closeOverlay();
        return;
      }

      if (
        filterType === 'vendor' &&
        typeof onApplyVendorFilter ===
          'function'
      ) {
        await onApplyVendorFilter(
          selectedItem.accountNumber
        );

        closeOverlay();
        return;
      }

      window.alert(
        'The filter apply function is not available.'
      );
    };

  return (
    <div
      className={
        `shared-filter-uf ${layoutClass}`
      }
    >
      <div className="shared-filter-instructions">
        {vendorOnly
          ? `To display a single Vendor in the ${pageLabel} table, select a vendor from either lookup menu below, then select APPLY FILTER.`
          : residentOnly
            ? `To display a single Resident in the ${pageLabel} table, select a resident from one of the lookup menus below, then select APPLY FILTER.`
            : `To display a single Resident or Vendor in the ${pageLabel} table, select an entry from one of the lookup menus below, then select APPLY FILTER.`}
      </div>

      <div className="shared-filter-heading">
        {vendorOnly
          ? 'Quick Vendor Search'
          : residentOnly
            ? 'Quick Resident Acct# Search - 3 Way'
            : 'Quick Resident / Vendor Acct# Search'}
      </div>

      {showResidents && (
        <>
          <label className="shared-filter-label sf-label-acct">
            ACCOUNT #
          </label>

          <PagedLookupCombo
            className="sf-select-acct"
            lookupType="resident-account"
            itemType="resident"
            value={displayValueFor(
              'resident-account'
            )}
            loadLookupOptions={
              effectiveLookupLoader
            }
            onSelect={(item) =>
              handleLookupSelection(
                item,
                'resident-account'
              )
            }
            isOpen={
              openLookupType ===
              'resident-account'
            }
            onToggle={() =>
              handleToggleLookup(
                'resident-account'
              )
            }
            onClose={() =>
              setOpenLookupType('')
            }
          />

          <label className="shared-filter-label sf-label-name">
            Resident Name
          </label>

          <PagedLookupCombo
            className="sf-select-name"
            lookupType="resident-name"
            itemType="resident"
            value={displayValueFor(
              'resident-name'
            )}
            loadLookupOptions={
              effectiveLookupLoader
            }
            onSelect={(item) =>
              handleLookupSelection(
                item,
                'resident-name'
              )
            }
            isOpen={
              openLookupType ===
              'resident-name'
            }
            onToggle={() =>
              handleToggleLookup(
                'resident-name'
              )
            }
            onClose={() =>
              setOpenLookupType('')
            }
          />

          <label className="shared-filter-label sf-label-address">
            Resident Address
          </label>

          <PagedLookupCombo
            className="sf-select-address"
            lookupType="resident-address"
            itemType="resident"
            value={displayValueFor(
              'resident-address'
            )}
            loadLookupOptions={
              effectiveLookupLoader
            }
            onSelect={(item) =>
              handleLookupSelection(
                item,
                'resident-address'
              )
            }
            isOpen={
              openLookupType ===
              'resident-address'
            }
            onToggle={() =>
              handleToggleLookup(
                'resident-address'
              )
            }
            onClose={() =>
              setOpenLookupType('')
            }
          />
        </>
      )}

      {showVendors && (
        <>
          <label className="shared-filter-label sf-label-vendor-name">
            Vendor Name
          </label>

          <PagedLookupCombo
            className="sf-select-vendor-name"
            lookupType="vendor-name"
            itemType="vendor"
            value={displayValueFor(
              'vendor-name'
            )}
            loadLookupOptions={
              effectiveLookupLoader
            }
            onSelect={(item) =>
              handleLookupSelection(
                item,
                'vendor-name'
              )
            }
            isOpen={
              openLookupType ===
              'vendor-name'
            }
            onToggle={() =>
              handleToggleLookup(
                'vendor-name'
              )
            }
            onClose={() =>
              setOpenLookupType('')
            }
          />

          <label className="shared-filter-label sf-label-vendor-acct">
            Vendor Acct#
          </label>

          <PagedLookupCombo
            className="sf-select-vendor-acct"
            lookupType="vendor-account"
            itemType="vendor"
            value={displayValueFor(
              'vendor-account'
            )}
            loadLookupOptions={
              effectiveLookupLoader
            }
            onSelect={(item) =>
              handleLookupSelection(
                item,
                'vendor-account'
              )
            }
            isOpen={
              openLookupType ===
              'vendor-account'
            }
            onToggle={() =>
              handleToggleLookup(
                'vendor-account'
              )
            }
            onClose={() =>
              setOpenLookupType('')
            }
          />
        </>
      )}

      <button
        type="button"
        className="shared-filter-apply"
        onClick={handleApplyFilter}
      >
        APPLY FILTER
      </button>

      <button
        type="button"
        className="shared-filter-clear"
        onClick={handleClear}
      >
        CLEAR
      </button>

      <div className="shared-filter-results-heading">
        SEARCH RESULTS:
      </div>

      {showResidents && (
        <>
          <label className="shared-filter-output-label sf-output-name-label">
            Resident Name
          </label>

          <input
            className="shared-filter-output sf-output-name"
            type="text"
            value={
              selectedItem?.type ===
              'resident'
                ? selectedItem.displayName
                : ''
            }
            readOnly
          />

          <label className="shared-filter-output-label sf-output-address-label">
            Resident Address
          </label>

          <input
            className="shared-filter-output sf-output-address"
            type="text"
            value={
              selectedItem?.type ===
              'resident'
                ? selectedItem.address
                : ''
            }
            readOnly
          />

          <label className="shared-filter-output-label sf-output-acct-label">
            ACCOUNT #
          </label>

          <input
            className="shared-filter-output sf-output-acct"
            type="text"
            value={
              selectedItem?.type ===
              'resident'
                ? selectedItem.accountNumber
                : ''
            }
            readOnly
          />
        </>
      )}

      {showVendors && (
        <>
          <label className="shared-filter-output-label sf-output-vendor-name-label">
            Vendor Name
          </label>

          <input
            className="shared-filter-output sf-output-vendor-name"
            type="text"
            value={
              selectedItem?.type ===
              'vendor'
                ? selectedItem.displayName
                : ''
            }
            readOnly
          />

          <label className="shared-filter-output-label sf-output-vendor-address-label">
            Vendor Address
          </label>

          <input
            className="shared-filter-output sf-output-vendor-address"
            type="text"
            value={
              selectedItem?.type ===
              'vendor'
                ? selectedItem.address
                : ''
            }
            readOnly
          />

          <label className="shared-filter-output-label sf-output-vendor-acct-label">
            Vendor ID:
          </label>

          <input
            className="shared-filter-output sf-output-vendor-acct"
            type="text"
            value={
              selectedItem?.type ===
              'vendor'
                ? selectedItem.accountNumber
                : ''
            }
            readOnly
          />
        </>
      )}
    </div>
  );
}

export default FilterUF;