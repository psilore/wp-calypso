import { useTranslate } from 'i18n-calypso';
import { SiteSlug } from 'calypso/types';
import { ScheduleListTableRow } from './schedule-list-table-row';
import type { MultisiteSchedulesUpdates } from 'calypso/data/plugins/use-update-schedules-query';

type Props = {
	schedules: MultisiteSchedulesUpdates[];
	onEditClick: ( id: string ) => void;
	onRemoveClick: ( id: string ) => void;
	onLogsClick: ( id: string, siteSlug: SiteSlug ) => void;
	search?: string;
};

export const ScheduleListTable = ( props: Props ) => {
	const { schedules, onEditClick, onLogsClick, onRemoveClick } = props;
	const translate = useTranslate();

	return (
		<table className="plugins-update-manager-multisite-table">
			<thead>
				<tr>
					<th></th>
					<th>{ translate( 'Name' ) }</th>
					<th>{ translate( 'Sites' ) }</th>
					<th>{ translate( 'Last update' ) }</th>
					<th>{ translate( 'Next update' ) }</th>
					<th>{ translate( 'Frequency' ) }</th>
					<th>{ translate( 'Plugins' ) }</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{ schedules.map( ( schedule ) => (
					<ScheduleListTableRow
						schedule={ schedule }
						onEditClick={ onEditClick }
						onRemoveClick={ onRemoveClick }
						onLogsClick={ onLogsClick }
						key={ schedule.id }
					/>
				) ) }
			</tbody>
		</table>
	);
};
