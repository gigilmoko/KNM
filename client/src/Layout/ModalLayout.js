import { useEffect } from 'react';
import { MODAL_BODY_TYPES } from '../utils/globalConstantUtil';
import { useSelector, useDispatch } from 'react-redux';
import { closeModal } from '../Layout/common/modalSlice';
import AddLeadModalBody from '../Layout/common/components/AddLeadModalBody';
import ConfirmationModalBody from '../Layout/common/components/ConfirmationModalBody';

function ModalLayout() {
  const { isOpen, bodyType, size, extraObject, title } = useSelector(state => state.modal);
  const dispatch = useDispatch();

  const close = (e) => {
    dispatch(closeModal(e));
  };

  return (
    <>
      {/* Modal Overlay */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center transition ${
          isOpen ? 'visible bg-black bg-opacity-40' : 'invisible'
        }`}
        style={{ transition: 'background 0.3s' }}
      >
        {/* Modal Box */}
        <div
          className={`relative bg-white rounded-2xl shadow-2xl w-full mx-2 sm:mx-0 ${
            size === 'lg' ? 'max-w-5xl' : 'max-w-lg'
          } ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} transition-all duration-300`}
        >
          {/* Close Button */}
          <button
            className="btn btn-sm btn-circle absolute right-3 top-3 bg-[#df1f47] text-white hover:bg-red-700 border-none"
            onClick={close}
            aria-label="Close"
          >
            ✕
          </button>
          {/* Title */}
          <h3 className="font-semibold text-2xl pb-6 text-center text-[#df1f47] mt-4">{title}</h3>
          {/* Modal Body */}
          <div className="px-4 pb-6">
            {
              {
                [MODAL_BODY_TYPES.LEAD_ADD_NEW]: (
                  <AddLeadModalBody closeModal={close} extraObject={extraObject} />
                ),
                [MODAL_BODY_TYPES.CONFIRMATION]: (
                  <ConfirmationModalBody extraObject={extraObject} closeModal={close} />
                ),
                [MODAL_BODY_TYPES.DEFAULT]: <div></div>,
              }[bodyType]
            }
          </div>
        </div>
      </div>
    </>
  );
}

export default ModalLayout;